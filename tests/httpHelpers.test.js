import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import {
  HttpError,
  clientIp,
  configuredBodyLimit,
  describeError,
  readBody,
  readJsonBody,
  safeDecodeURIComponent
} from '../src/app/http.js';
import {
  buildContentSecurityPolicy,
  checkAdminToken,
  connectOriginsFromChainConfig,
  createRateLimiter,
  envInt
} from '../src/app/security.js';
import { ValidationError } from '../src/core/schema.js';

/** A request-like object: a Readable of the given chunks plus headers. */
function fakeRequest(chunks, headers = {}) {
  const stream = Readable.from(chunks.map((chunk) => Buffer.from(chunk)));
  stream.headers = headers;
  return stream;
}

test('readBody enforces the limit while streaming and by declared Content-Length', async () => {
  const ok = await readBody(fakeRequest(['abc', 'def']), { limit: 6 });
  assert.equal(ok.toString(), 'abcdef');

  await assert.rejects(readBody(fakeRequest(['abc', 'defg']), { limit: 6 }), (error) => {
    assert.ok(error instanceof HttpError);
    assert.equal(error.status, 413);
    assert.equal(error.code, 'payload_too_large');
    return true;
  });

  // A lying/honest Content-Length over the limit is refused before any byte is read.
  let touched = false;
  const declared = fakeRequest([], { 'content-length': '999999' });
  declared.iterator = () => { touched = true; return (async function* () {})(); };
  await assert.rejects(readBody(declared, { limit: 10 }), (error) => error.status === 413);
  assert.equal(touched, false, 'body must not be read when Content-Length already exceeds the limit');
});

test('readJsonBody: empty -> null, valid -> parsed, malformed -> 400 invalid_json', async () => {
  assert.equal(await readJsonBody(fakeRequest([])), null);
  assert.equal(await readJsonBody(fakeRequest(['  \n '])), null);
  assert.deepEqual(await readJsonBody(fakeRequest(['{"a":', '1}'])), { a: 1 });
  await assert.rejects(readJsonBody(fakeRequest(['{oops'])), (error) => error.status === 400 && error.code === 'invalid_json');
});

test('configuredBodyLimit honours AGENTBL_MAX_BODY_BYTES and ignores junk', () => {
  assert.equal(configuredBodyLimit({}), 1024 * 1024);
  assert.equal(configuredBodyLimit({ AGENTBL_MAX_BODY_BYTES: '4096' }), 4096);
  for (const junk of ['0', '-5', 'abc', '1.5', '']) {
    assert.equal(configuredBodyLimit({ AGENTBL_MAX_BODY_BYTES: junk }), 1024 * 1024, junk);
  }
});

test('safeDecodeURIComponent turns malformed escapes into a 400', () => {
  assert.equal(safeDecodeURIComponent('a%20b'), 'a b');
  assert.throws(() => safeDecodeURIComponent('%E0%A4%A'), (error) => error.status === 400 && error.code === 'malformed_url');
});

test('describeError maps known failures to statuses and hides everything else', () => {
  assert.deepEqual(describeError(new HttpError(404, 'nope', 'missing', { x: 1 })), { status: 404, code: 'nope', message: 'missing', details: { x: 1 } });
  const validation = describeError(new ValidationError('Bad thing', ['a is wrong', 'b is wrong']));
  assert.equal(validation.status, 400);
  assert.deepEqual(validation.details, ['a is wrong', 'b is wrong']);
  assert.equal(describeError(new SyntaxError('Unexpected token')).status, 400);
  assert.equal(describeError(new URIError('URI malformed')).status, 400);
  assert.equal(describeError(Object.assign(new Error('bad envelope'), { code: 'paid_report_invalid', errors: ['e'] })).status, 400);

  const internal = describeError(new TypeError("Cannot read properties of null (reading 'secret')"));
  assert.equal(internal.status, 500);
  assert.equal(internal.message, 'Internal server error');
  assert.ok(!JSON.stringify(internal).includes('secret'));
});

test('clientIp trusts X-Forwarded-For only for the configured number of proxy hops', () => {
  const request = { socket: { remoteAddress: '::ffff:10.0.0.9' }, headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3' } };
  assert.equal(clientIp(request, {}), '10.0.0.9', 'header is ignored by default (spoofable)');
  assert.equal(clientIp(request, { TRUST_PROXY: 'true' }), '3.3.3.3', 'one hop -> the entry our proxy appended');
  assert.equal(clientIp(request, { TRUST_PROXY: '2' }), '2.2.2.2');
  assert.equal(clientIp(request, { TRUST_PROXY: '9' }), '10.0.0.9', 'more hops than entries falls back to the socket');
  assert.equal(clientIp({ socket: { remoteAddress: undefined }, headers: {} }, {}), 'unknown');
});

test('createRateLimiter counts per key in fixed windows and stays bounded', () => {
  let clock = 1_000;
  const limiter = createRateLimiter({ windowMs: 1000, max: 2, maxKeys: 3, now: () => clock });
  assert.equal(limiter.take('a').allowed, true);
  assert.equal(limiter.take('a').allowed, true);
  const blocked = limiter.take('a');
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.equal(blocked.retryAfterSeconds, 1);
  assert.equal(limiter.take('b').allowed, true, 'keys are independent');

  clock += 1001;
  assert.equal(limiter.take('a').allowed, true, 'a new window starts after windowMs');

  for (const key of ['k1', 'k2', 'k3', 'k4', 'k5', 'k6']) limiter.take(key);
  assert.ok(limiter.size <= 4, `table must stay bounded, got ${limiter.size}`);
  limiter.reset();
  assert.equal(limiter.size, 0);
});

test('envInt accepts non-negative integers only', () => {
  assert.equal(envInt({ N: '7' }, 'N', 1), 7);
  assert.equal(envInt({ N: '0' }, 'N', 1), 0, '0 is meaningful (disables a limiter)');
  for (const junk of ['-1', '1.5', 'x', undefined]) assert.equal(envInt({ N: junk }, 'N', 9), 9);
});

test('checkAdminToken: fail closed, constant-time, Bearer or X-Admin-Token', () => {
  const token = 'a-sufficiently-long-secret';
  const env = { AGENTBL_ADMIN_TOKEN: token };
  const withHeaders = (headers) => ({ headers });

  assert.deepEqual(checkAdminToken(withHeaders({}), {}), { configured: false, authorized: false });
  assert.deepEqual(checkAdminToken(withHeaders({ authorization: `Bearer ${token}` }), { AGENTBL_ADMIN_TOKEN: 'short' }),
    { configured: false, authorized: false }, 'a token shorter than 16 chars is treated as not configured');

  assert.deepEqual(checkAdminToken(withHeaders({}), env), { configured: true, authorized: false });
  assert.deepEqual(checkAdminToken(withHeaders({ authorization: 'Bearer wrong' }), env), { configured: true, authorized: false });
  assert.deepEqual(checkAdminToken(withHeaders({ authorization: `bearer ${token}` }), env), { configured: true, authorized: true });
  assert.deepEqual(checkAdminToken(withHeaders({ 'x-admin-token': token }), env), { configured: true, authorized: true });
  assert.deepEqual(checkAdminToken(withHeaders({ authorization: `Bearer ${token}x` }), env), { configured: true, authorized: false });
});

test('the CSP allows only same-origin scripts and lists the chain hosts the wallet flow needs', () => {
  const csp = buildContentSecurityPolicy({ connectSrc: ['https://rpc.example'] });
  const directive = (name) => csp.split('; ').find((part) => part.startsWith(`${name} `));
  assert.equal(directive('script-src'), "script-src 'self' 'wasm-unsafe-eval'");
  assert.equal(directive('object-src'), "object-src 'none'");
  assert.equal(directive('frame-ancestors'), "frame-ancestors 'none'");
  assert.equal(directive('connect-src'), "connect-src 'self' https://rpc.example");
  assert.ok(!csp.includes("'unsafe-eval'"), "JS eval must stay blocked ('wasm-unsafe-eval' only covers WebAssembly)");
  assert.ok(!csp.includes("'unsafe-inline'") || !directive('script-src').includes("'unsafe-inline'"));
});

test('connectOriginsFromChainConfig extracts, normalises and de-duplicates origins', () => {
  const origins = connectOriginsFromChainConfig({
    networks: {
      a: {
        rpcUrls: ['https://rpc.a.example/path/', 'https://rpc.a.example/other'],
        wsUrls: ['wss://ws.a.example/'],
        cosmosRpcUrl: 'https://cosmos.a.example:443',
        explorerApi: 'https://api.a.example/api',
        explorerBase: 'https://scan.a.example'
      },
      b: { rpcUrls: ['not a url'], explorerBase: null }
    }
  });
  for (const expected of ['https://rpc.a.example', 'wss://ws.a.example', 'https://cosmos.a.example', 'https://api.a.example', 'https://scan.a.example']) {
    assert.ok(origins.includes(expected), `missing ${expected}`);
  }
  assert.equal(origins.filter((origin) => origin === 'https://rpc.a.example').length, 1);
  assert.ok(origins.includes('https://k8s.testnet.json-rpc.injective.network'), 'built-in RPC hosts always present');
  assert.ok(!origins.some((origin) => origin.includes('not a url')));
  assert.ok(connectOriginsFromChainConfig(null).length >= 2, 'a missing registry still yields the built-ins');
});
