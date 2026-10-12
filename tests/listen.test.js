import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import http from 'node:http';
import { FETCH_BLOCKED_PORTS, listenOnUsablePort } from '../scripts/lib/listen.mjs';

test('the blocked-port list covers the ports that made fetch fail on this kind of host', () => {
  for (const port of [6000, 6566, 6665, 6669, 6697, 10080, 4045, 5060]) assert.ok(FETCH_BLOCKED_PORTS.has(port), String(port));
  for (const port of [3000, 8080, 40000, 49152]) assert.ok(!FETCH_BLOCKED_PORTS.has(port), String(port));
});

test('listenOnUsablePort gives back a bound port and a working server', async (t) => {
  const server = http.createServer((_request, response) => response.end('ok'));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const port = await listenOnUsablePort(server, '127.0.0.1');
  assert.ok(Number.isInteger(port) && port > 0 && !FETCH_BLOCKED_PORTS.has(port));
  assert.equal(await (await fetch(`http://127.0.0.1:${port}/`)).text(), 'ok');
});

/** A stand-in for net.Server that hands out a scripted sequence of ports. */
class ScriptedServer extends EventEmitter {
  constructor(ports) {
    super();
    this.ports = [...ports];
    this.current = null;
    this.closed = 0;
  }

  listen() {
    this.current = this.ports.shift();
    queueMicrotask(() => this.emit('listening'));
    return this;
  }

  address() {
    return { port: this.current };
  }

  close(callback) {
    this.closed += 1;
    queueMicrotask(callback);
    return this;
  }
}

test('a blocked port is released and another one is requested', async () => {
  const server = new ScriptedServer([6665, 6666, 6667, 40123]);
  assert.equal(await listenOnUsablePort(server), 40123);
  assert.equal(server.closed, 3, 'every blocked port is closed again');
});

test('listenOnUsablePort gives up instead of looping forever', async () => {
  const server = new ScriptedServer(Array.from({ length: 5 }, () => 6000));
  await assert.rejects(listenOnUsablePort(server, undefined, { attempts: 3 }), /fetch accepts/u);
});

test('a listen error is reported, not swallowed', async () => {
  const taken = http.createServer();
  await listenOnUsablePort(taken, '127.0.0.1');
  const clash = http.createServer();
  clash.listen = function listen() {
    queueMicrotask(() => this.emit('error', Object.assign(new Error('boom'), { code: 'EADDRINUSE' })));
    return this;
  };
  await assert.rejects(listenOnUsablePort(clash, '127.0.0.1'), /boom/u);
  await new Promise((resolve) => taken.close(resolve));
});
