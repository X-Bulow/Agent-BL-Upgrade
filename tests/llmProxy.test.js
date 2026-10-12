import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { clearLlmEnv, listen, requestJson } from './helpers/http.js';

process.env.LLM_RATE_LIMIT_PER_MIN = '0'; // this file sends many /api/llm/chat requests from one IP
const { createServer } = await import('../src/app/server.js');
const { normalizeChatRequest } = await import('../src/app/llmProxy.js');

const RELAY_KEY = 'sk-unit-test-relay-key-0123';

/** A scriptable OpenAI-compatible upstream. */
async function startUpstream() {
  const state = { mode: 'json', received: [], closedEarly: 0 };
  const server = http.createServer((request, response) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => {
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      state.received.push({ url: request.url, headers: request.headers, body });
      response.on('close', () => { if (!response.writableEnded) state.closedEarly += 1; });

      const json = (status, payload) => {
        response.writeHead(status, { 'content-type': 'application/json' });
        response.end(JSON.stringify(payload));
      };
      switch (state.mode) {
        case 'tool':
          return json(200, { choices: [{ message: { role: 'assistant', content: null, tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'filter_eBLs', arguments: '{"matched_ids":["A"]}' } }] } }] });
        case 'stream':
          response.writeHead(200, { 'content-type': 'text/event-stream' });
          response.write('data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n');
          response.write('data: {"choices":[{"delta":{"content":"lo"}}]}\n\n');
          return response.end('data: [DONE]\n\n');
        case 'hang-stream':
          response.writeHead(200, { 'content-type': 'text/event-stream' });
          return response.write('data: {"choices":[{"delta":{"content":"partial"}}]}\n\n'); // never ends
        case 'slow':
          return setTimeout(() => json(200, { choices: [{ message: { role: 'assistant', content: 'slow answer' } }] }), 250);
        case 'error401':
          return json(401, { error: { message: 'invalid api key sk-LEAKED-UPSTREAM-DETAIL' } });
        case 'error429':
          return json(429, { error: 'slow down' });
        case 'empty':
          return json(200, { choices: [] });
        default:
          return json(200, { choices: [{ message: { role: 'assistant', content: 'hello from upstream' } }] });
      }
    });
  });
  const handle = await listen(server);
  return { ...handle, state };
}

const chat = (base, body) => requestJson(base, 'POST', '/api/llm/chat', body);
const userMessage = (content = 'hi') => ({ role: 'user', content });

test('LLM relay', async (t) => {
  clearLlmEnv();
  const upstream = await startUpstream();
  const app = await listen(createServer());
  const configure = () => {
    clearLlmEnv();
    process.env.LLM_BASE_URL = `${upstream.base}/v1`;
    process.env.LLM_API_KEY = RELAY_KEY;
    process.env.LLM_MODEL = 'relay-model';
  };
  t.beforeEach(() => { configure(); upstream.state.mode = 'json'; upstream.state.received.length = 0; upstream.state.closedEarly = 0; });
  t.after(async () => { clearLlmEnv(); await app.close(); await upstream.close(); });

  await t.test('status reveals the provider and model but never the key', async () => {
    const res = await requestJson(app.base, 'GET', '/api/llm/status');
    assert.equal(res.status, 200);
    assert.deepEqual({ enabled: res.data.enabled, configured: res.data.configured, provider: res.data.provider, model: res.data.model },
      { enabled: true, configured: true, provider: 'custom', model: 'relay-model' });
    assert.ok(!res.text.includes(RELAY_KEY));
  });

  await t.test('relays a completion with the server key; model, token cap and shape are server-controlled', async () => {
    const res = await chat(app.base, {
      model: 'attacker-model',
      max_tokens: 999_999,
      temperature: 0.7,
      stream: false,
      attacker_field: 'x',
      messages: [{ role: 'system', content: 'be brief' }, userMessage()],
      tools: [{ name: 'filter_eBLs', description: 'pick cases', parameters: { type: 'object', properties: { ids: { type: 'array' } } } }]
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.choices[0].message.content, 'hello from upstream');
    assert.ok(!res.text.includes(RELAY_KEY), 'the key must not appear in the browser response');

    const [call] = upstream.state.received;
    assert.equal(call.url, '/v1/chat/completions');
    assert.equal(call.headers.authorization, `Bearer ${RELAY_KEY}`);
    assert.equal(call.body.model, 'relay-model', 'client-chosen model is ignored');
    assert.equal(call.body.max_tokens, 2048, 'output size is capped by the server');
    assert.equal(call.body.temperature, 0.7);
    assert.equal(call.body.stream, false);
    assert.equal(call.body.tool_choice, 'auto');
    assert.equal(call.body.tools[0].type, 'function');
    assert.equal(call.body.tools[0].function.name, 'filter_eBLs');
    assert.ok(!('attacker_field' in call.body), 'unknown request fields are dropped');
  });

  await t.test('tool calls and tool results round-trip', async () => {
    upstream.state.mode = 'tool';
    const first = await chat(app.base, { messages: [userMessage('find copper')], tools: [{ name: 'filter_eBLs', description: 'd' }] });
    assert.equal(first.status, 200);
    const toolCall = first.data.choices[0].message.tool_calls[0];
    assert.equal(toolCall.function.name, 'filter_eBLs');

    upstream.state.mode = 'json';
    const second = await chat(app.base, {
      messages: [
        userMessage('find copper'),
        { role: 'assistant', content: null, tool_calls: [toolCall] },
        { role: 'tool', tool_call_id: toolCall.id, content: '{"ok":true}' }
      ]
    });
    assert.equal(second.status, 200);
    const sent = upstream.state.received.at(-1).body.messages;
    assert.equal(sent[1].tool_calls[0].id, 'call_1');
    assert.equal(sent[2].tool_call_id, 'call_1');
  });

  await t.test('streams server-sent events through unchanged', async () => {
    upstream.state.mode = 'stream';
    const response = await fetch(`${app.base}/api/llm/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [userMessage()], stream: true })
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'text/event-stream');
    assert.equal(response.headers.get('x-accel-buffering'), 'no');
    const text = await response.text();
    assert.ok(text.includes('"content":"Hel"') && text.includes('"content":"lo"') && text.includes('[DONE]'));
    assert.equal(upstream.state.received[0].body.stream, true);
    assert.ok(!text.includes(RELAY_KEY));
  });

  await t.test('rejects malformed requests before touching the provider', async () => {
    const tooManyMessages = Array.from({ length: 61 }, () => userMessage());
    const cases = {
      'empty messages': { messages: [] },
      'messages not an array': { messages: 'hi' },
      'missing messages': {},
      'bad role': { messages: [{ role: 'root', content: 'x' }] },
      'non-string content': { messages: [{ role: 'user', content: { evil: true } }] },
      'content too long': { messages: [userMessage('x'.repeat(32_001))] },
      'too many messages': { messages: tooManyMessages },
      'tool name with spaces': { messages: [userMessage()], tools: [{ name: 'drop table', description: 'x' }] },
      'too many tools': { messages: [userMessage()], tools: Array.from({ length: 17 }, (_, i) => ({ name: `t${i}`, description: 'x' })) },
      'temperature out of range': { messages: [userMessage()], temperature: 5 },
      'max_tokens not a positive integer': { messages: [userMessage()], max_tokens: 0 },
      'body is an array': []
    };
    for (const [label, body] of Object.entries(cases)) {
      const res = await chat(app.base, body);
      assert.equal(res.status, 400, label);
      assert.equal(res.data.code, 'invalid_llm_request', label);
    }
    assert.equal(upstream.state.received.length, 0, 'invalid input must never reach the provider');
  });

  await t.test('oversized request bodies are refused with 413', async () => {
    const res = await chat(app.base, { messages: [userMessage()], pad: 'x'.repeat(300 * 1024) });
    assert.equal(res.status, 413);
    assert.equal(upstream.state.received.length, 0);
  });

  await t.test('answers 503 when no provider is configured, and 404 when the relay is disabled', async () => {
    clearLlmEnv();
    const missing = await chat(app.base, { messages: [userMessage()] });
    assert.equal(missing.status, 503);
    assert.equal(missing.data.code, 'llm_not_configured');
    assert.deepEqual((await requestJson(app.base, 'GET', '/api/llm/status')).data.configured, false);

    configure();
    process.env.LLM_PROXY_ENABLED = 'false';
    const disabled = await chat(app.base, { messages: [userMessage()] });
    assert.equal(disabled.status, 404);
    assert.equal(disabled.data.code, 'llm_proxy_disabled');
    assert.equal((await requestJson(app.base, 'GET', '/api/llm/status')).data.enabled, false);
    assert.equal(upstream.state.received.length, 0);
  });

  await t.test('upstream failures are mapped without leaking provider details', async () => {
    upstream.state.mode = 'error401';
    const unauthorised = await chat(app.base, { messages: [userMessage()] });
    assert.equal(unauthorised.status, 502);
    assert.equal(unauthorised.data.code, 'llm_upstream_error');
    assert.ok(!unauthorised.text.includes('LEAKED-UPSTREAM-DETAIL'));
    assert.ok(!unauthorised.text.includes(RELAY_KEY));

    upstream.state.mode = 'error429';
    const limited = await chat(app.base, { messages: [userMessage()] });
    assert.equal(limited.status, 429);
    assert.equal(limited.data.code, 'llm_rate_limited');

    upstream.state.mode = 'empty';
    const empty = await chat(app.base, { messages: [userMessage()] });
    assert.equal(empty.status, 502);

    process.env.LLM_BASE_URL = 'http://127.0.0.1:1/v1'; // nothing listens here
    const unreachable = await chat(app.base, { messages: [userMessage()] });
    assert.equal(unreachable.status, 502);
    assert.equal(unreachable.data.code, 'llm_upstream_unreachable');
  });

  await t.test('caps concurrent upstream calls', async () => {
    upstream.state.mode = 'slow';
    process.env.LLM_PROXY_MAX_CONCURRENCY = '1';
    try {
      const [a, b] = await Promise.all([
        chat(app.base, { messages: [userMessage('one')] }),
        new Promise((resolve) => setTimeout(resolve, 60)).then(() => chat(app.base, { messages: [userMessage('two')] }))
      ]);
      const statuses = [a.status, b.status].sort();
      assert.deepEqual(statuses, [200, 429]);
      const busy = [a, b].find((res) => res.status === 429);
      assert.equal(busy.data.code, 'llm_busy');
      assert.equal(busy.headers.get('retry-after'), '2');

      upstream.state.mode = 'json';
      assert.equal((await chat(app.base, { messages: [userMessage('three')] })).status, 200, 'the slot is released afterwards');
    } finally {
      delete process.env.LLM_PROXY_MAX_CONCURRENCY;
    }
  });

  await t.test('aborts the upstream request when the browser disconnects mid-stream', async () => {
    upstream.state.mode = 'hang-stream';
    const controller = new AbortController();
    const response = await fetch(`${app.base}/api/llm/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [userMessage()], stream: true }),
      signal: controller.signal
    });
    const reader = response.body.getReader();
    const first = await reader.read();
    assert.ok(new TextDecoder().decode(first.value).includes('partial'));
    controller.abort();
    await reader.cancel().catch(() => {});

    const deadline = Date.now() + 2000;
    while (upstream.state.closedEarly === 0 && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 25));
    assert.equal(upstream.state.closedEarly, 1, 'the provider connection must be torn down, not left streaming');
  });
});

test('normalizeChatRequest clamps and normalises', () => {
  const normalized = normalizeChatRequest({
    messages: [{ role: 'user', content: 'x', extra: 'dropped' }],
    tools: [{ type: 'function', function: { name: 'a_b-1', description: 'd', parameters: { type: 'object' } } }],
    max_tokens: 100_000
  });
  assert.equal(normalized.maxTokens, 2048);
  assert.equal(normalized.temperature, 0.3);
  assert.equal(normalized.stream, false);
  assert.deepEqual(normalized.messages, [{ role: 'user', content: 'x' }]);
  assert.equal(normalized.tools[0].function.name, 'a_b-1');
});
