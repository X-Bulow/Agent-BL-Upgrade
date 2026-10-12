// The Demo (personal-sign) x402 transport after hardening.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Wallet } from 'ethers';
import { listen, requestJson } from './helpers/http.js';

process.env.DEMO_MODE = 'true';
process.env.X402_MODE = 'demo';
delete process.env.X402_FACILITATOR_URL;
delete process.env.X402_PAY_TO;
process.env.AGENTBL_RATE_LIMIT_PER_MIN = '0';
process.env.AGENTBL_WRITE_RATE_LIMIT_PER_MIN = '0';
const { createServer } = await import('../src/app/server.js');

const RISK = '/api/x402/intel/premium-risk';
const CLIENT_CLAIMED_TX = `0x${'12'.repeat(32)}`;

async function signedHeaders(base, wallet, endpoint = RISK) {
  const challenge = (await requestJson(base, 'POST', endpoint, {})).data;
  return {
    nonce: challenge.nonce,
    headers: {
      'x402-signature': await wallet.signMessage(challenge.challenge),
      'x402-signer': wallet.address
    }
  };
}

test('Demo x402 transport', async (t) => {
  const app = await listen(createServer());
  t.after(() => app.close());
  const wallet = Wallet.createRandom();

  await t.test('a signed request unlocks a clearly-simulated report', async () => {
    const { nonce, headers } = await signedHeaders(app.base, wallet);
    const res = await requestJson(app.base, 'POST', RISK, { nonce }, headers);
    assert.equal(res.status, 200, res.text);
    assert.equal(res.data.payment.live, false);
    assert.match(res.data.report_envelope.payment_tx, /^demo:\/\/receipt\//u);
    assert.match(res.headers.get('payment-response'), /"txHash"/u);
  });

  await t.test('a client-claimed X402-TxHash is never treated as a verified, settled payment', async () => {
    const { nonce, headers } = await signedHeaders(app.base, wallet);
    const res = await requestJson(app.base, 'POST', RISK, { nonce }, { ...headers, 'x402-txhash': CLIENT_CLAIMED_TX });
    assert.equal(res.status, 200, res.text);
    assert.equal(res.data.payment.live, false, 'the personal-sign transport cannot verify a transaction');
    assert.notEqual(res.data.payment.txHash, CLIENT_CLAIMED_TX);
    assert.ok(!res.data.report_envelope.payment_tx.includes('12121212'), 'the unverified hash must not reach the envelope');
    assert.equal(res.data.payment.attestationTxHash, null);
  });

  await t.test('a malformed X402-TxHash is a 400', async () => {
    const { nonce, headers } = await signedHeaders(app.base, wallet);
    const res = await requestJson(app.base, 'POST', RISK, { nonce }, { ...headers, 'x402-txhash': '0xnothex' });
    assert.equal(res.status, 400);
    assert.equal(res.data.code, 'invalid_tx_hash');
  });

  await t.test('an oversized request body is refused with 413', async () => {
    process.env.AGENTBL_MAX_BODY_BYTES = '1024';
    try {
      const { headers } = await signedHeaders(app.base, wallet);
      const res = await requestJson(app.base, 'POST', RISK, JSON.stringify({ pad: 'x'.repeat(8000) }), headers);
      assert.equal(res.status, 413);
      assert.equal(res.data.code, 'payload_too_large');
    } finally {
      delete process.env.AGENTBL_MAX_BODY_BYTES;
    }
  });

  await t.test('a signature from a different wallet than the claimed signer is a 401', async () => {
    const { nonce, headers } = await signedHeaders(app.base, wallet);
    const res = await requestJson(app.base, 'POST', RISK, { nonce }, { ...headers, 'x402-signer': Wallet.createRandom().address });
    assert.equal(res.status, 401);
  });

  await t.test('invalid input is rejected before the (simulated) payment is recorded', async () => {
    const { nonce, headers } = await signedHeaders(app.base, wallet);
    const res = await requestJson(app.base, 'POST', RISK, { nonce, case: 'not an object' }, headers);
    assert.equal(res.status, 400);
    assert.equal(res.data.code, 'invalid_request');
    assert.equal(res.data.payment.status, 'not_settled');
  });

  await t.test('a case the engine cannot price is refused BEFORE payment, without leaking engine internals', async () => {
    // macro_risk_events: 5 makes the report builder throw a TypeError (".map is not a function").
    const { nonce, headers } = await signedHeaders(app.base, wallet);
    const res = await requestJson(app.base, 'POST', RISK, {
      nonce, case: { case_id: 'X', shipment_events: 5, macro_risk_events: 5 }
    }, headers);
    assert.equal(res.status, 400);
    assert.equal(res.data.code, 'invalid_case');
    assert.equal(res.data.payment.status, 'not_settled', 'the buyer must not be charged for a request that cannot be served');
    assert.ok(!/is not a function|Cannot read properties|at .*.js/u.test(res.text), res.text.slice(0, 200));
  });
});
