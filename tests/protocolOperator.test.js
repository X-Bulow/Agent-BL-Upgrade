import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  OFFERING_STATES,
  eblMetadata,
  marketQuote,
  offeringTerms,
  revertReason
} from '../scripts/protocol-operator.mjs';

const copper = JSON.parse(fs.readFileSync(new URL('../data/cases/copper-sg-shanghai.case.json', import.meta.url)));
const warCrisis = JSON.parse(fs.readFileSync(new URL('../data/cases/copper-sg-shanghai-warcrisis.case.json', import.meta.url)));

test('protocol operator: offering terms follow the market quote in contract units', () => {
  const quote = marketQuote(copper);
  const terms = offeringTerms(copper, quote);
  assert.equal(terms.issuePriceE6, BigInt(Math.round(quote.final_issue_price_usd * 1e6)));
  assert.equal(terms.tokenSupply, BigInt(Math.round(quote.recommended_token_supply)));
  assert.equal(terms.targetRedemptionE6, 1_000_000n);
  assert.match(terms.quoteHash, /^0x[0-9a-f]{64}$/u);
  assert.match(terms.evidenceHash, /^0x[0-9a-f]{64}$/u);
});

test('protocol operator: the AI pause decision is carried to the oracle action code', () => {
  const quote = marketQuote(warCrisis);
  assert.equal(quote.pricing_action, 'PAUSE_OFFERING');
  assert.equal(offeringTerms(warCrisis, quote).action, 3);
});

test('protocol operator: rejects an issue price above the target redemption value', () => {
  assert.throws(
    () => offeringTerms(copper, { final_issue_price_usd: 1.01, recommended_token_supply: 10 }),
    /outside \(0, 1\]/u
  );
});

test('protocol operator: eBL metadata is unique per case and satisfies mintEBLV2', () => {
  const a = eblMetadata(copper);
  const b = eblMetadata(warCrisis);
  assert.notEqual(a.cargoHash, b.cargoHash);
  assert.ok(a.metadata.cargo.length > 0);
  assert.ok(a.metadata.quantity > 0n);
  assert.ok(a.metadata.hsCode.length > 0);
  assert.equal(a.metadata.declaredValueUsdE6, BigInt(copper.bill_of_lading.declared_value_usd) * 1_000_000n);
});

test('protocol operator: decodes revert reasons and keeps the contract state order', () => {
  assert.equal(revertReason({ reason: 'not open' }), 'not open');
  assert.equal(
    revertReason({ message: "VM Exception while processing transaction: reverted with reason string 'already disbursed'" }),
    'already disbursed'
  );
  assert.equal(revertReason(new Error('plain failure')), 'plain failure');
  assert.equal(OFFERING_STATES.length, 13);
  assert.equal(OFFERING_STATES[10], 'Redeemed');
});
