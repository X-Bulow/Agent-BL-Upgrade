// No malformed request may ever produce a 5xx. This is the regression net for the
// class of bug where an unexpected body shape (null, array, wrong field type) threw
// inside a handler and surfaced as a 500 / leaked internals.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listen, requestJson } from './helpers/http.js';

process.env.AGENTBL_RATE_LIMIT_PER_MIN = '0';
process.env.AGENTBL_WRITE_RATE_LIMIT_PER_MIN = '0';
const { createServer } = await import('../src/app/server.js');

const POST_ROUTES = [
  '/api/risk/analyze', '/api/workflow/simulate', '/api/pricing/quote', '/api/pricing/quote?compare=true',
  '/api/mystery/preview', '/api/market/search', '/api/pool/subscribe', '/api/offering/simulate',
  '/api/workflow/pricing-simulate', '/api/oracle/pricing-update', '/api/scenarios/run', '/api/mcp/call',
  '/api/rag/search', '/api/rag/risk-sweep', '/api/intel/world-risk', '/api/skill/pricing-analyst',
  '/api/skill/demo-operator', '/api/x402/smoke', '/api/ebl/upload', '/api/demo/mode',
  '/api/mystery/abc/passport/claim', '/api/x402/intel/premium-risk', '/api/x402/valuation/premium',
  '/api/x402/documents/fraud-review', '/api/x402/mystery/voyage'
];

const GET_ROUTES = [
  '/api/ebl/document-status', '/api/pool/status', '/api/investors/portfolio', '/api/mystery/passports',
  '/api/mystery/x/proof', '/api/mystery/passport/x/verify', '/api/x402/report/x', '/api/agent/activity?case_id=%00',
  '/api/x402/config', '/api/cases', '/api/market/listings', '/api/exporters/dashboard'
];

const BODIES = [
  undefined, 'null', '[]', '"str"', '123', 'true', '{}', '{"a":1}', '{"case":null}', '{"case":5}', '{"case_id":"x"}',
  '{"tool":5}', '{"tool":"x","params":5}', '{"query":5}', '{"file":5}', '{"file":{}}', '{"messages":5}', '{"mode":5}',
  '{bad json', '{"events":"x"}', '{"events":[null]}', '{"events":[1,"a",[]]}', '{"case":{"bill_of_lading":5}}',
  '{"bill_of_lading":{}}', '{"payout_speed":5}', '{"requested_cash_usd":"abc"}', '{"amount_usd":"1e999","pool_id":5}'
];

test('no route answers a malformed request with a 5xx', async (t) => {
  const app = await listen(createServer());
  t.after(() => app.close());

  const failures = [];
  for (const route of POST_ROUTES) {
    for (const body of BODIES) {
      const res = await requestJson(app.base, 'POST', route, body);
      if (res.status >= 500) failures.push(`POST ${route} body=${body ?? '(none)'} -> ${res.status}`);
      assert.ok(!/Cannot read properties|is not iterable|is not a function|at .*\.js:\d+/u.test(res.text),
        `POST ${route} body=${body ?? '(none)'} leaked internals: ${res.text.slice(0, 120)}`);
    }
  }
  for (const route of GET_ROUTES) {
    const res = await requestJson(app.base, 'GET', route);
    if (res.status >= 500) failures.push(`GET ${route} -> ${res.status}`);
  }
  assert.deepEqual(failures, [], `unexpected server errors:\n${failures.join('\n')}`);
});

test('valid input is still accepted after the validation tightening', async (t) => {
  const app = await listen(createServer());
  t.after(() => app.close());

  assert.equal((await requestJson(app.base, 'POST', '/api/pricing/quote', {})).status, 200, 'empty object = wrapper around the demo case');
  assert.equal((await requestJson(app.base, 'POST', '/api/risk/analyze')).status, 200, 'empty body = demo case');
  assert.equal((await requestJson(app.base, 'POST', '/api/skill/pricing-analyst')).status, 200, 'empty body = default demo case');
  const skill = await requestJson(app.base, 'POST', '/api/skill/pricing-analyst', { case_id: 'CASE-EBL-2026-0001', payout_speed: 'FAST' });
  assert.equal(skill.status, 200);
  assert.equal(skill.data.analysis.payout_speed, 'FAST');

  const badSpeed = await requestJson(app.base, 'POST', '/api/skill/pricing-analyst', { case_id: 'CASE-EBL-2026-0001', payout_speed: 'WARP' });
  assert.equal(badSpeed.status, 400);
  const noCaseId = await requestJson(app.base, 'POST', '/api/skill/demo-operator', {});
  assert.equal(noCaseId.status, 400);
  assert.equal(noCaseId.data.code, 'invalid_request');

  const badEvents = await requestJson(app.base, 'POST', '/api/offering/simulate', { events: [null] });
  assert.equal(badEvents.status, 400);
  assert.match(badEvents.data.error, /events must be an array of objects/u);
});
