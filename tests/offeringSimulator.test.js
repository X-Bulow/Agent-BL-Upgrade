import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { simulateOffering } from '../src/core/offeringSimulator.js';
import { RWA_OFFERING_STATES } from '../src/core/pricingSchema.js';

const copperCase = JSON.parse(
  await fs.readFile(new URL('../data/cases/copper-sg-shanghai.case.json', import.meta.url), 'utf8')
);
const warCase = JSON.parse(
  await fs.readFile(new URL('../data/cases/copper-sg-shanghai-warcrisis.case.json', import.meta.url), 'utf8')
);

const states = (o) => o.steps.map((s) => s.state);

test('BE-4: a healthy offering runs Created -> ... -> Redeemed', () => {
  const offering = simulateOffering(copperCase, { payout_speed: 'FAST' });
  assert.equal(offering.final_state, 'Redeemed');
  const seq = states(offering);
  for (const expected of ['Created', 'Priced', 'Open', 'Subscribed', 'Funded', 'InTransit', 'Repaid', 'Redeemed']) {
    assert.ok(seq.includes(expected), `missing state ${expected}`);
  }
  // every emitted state is a valid RWA offering state
  assert.ok(seq.every((s) => RWA_OFFERING_STATES.includes(s)));
});

test('BE-4: an in-transit risk shock reprices the pool down', () => {
  const offering = simulateOffering(copperCase, {
    payout_speed: 'FAST',
    events: [
      { category: 'macro', type: 'severe_weather', severity: 'warning', region: 'East China Sea', description: 'typhoon' },
      { category: 'shipment', type: 'route_deviation', severity: 'warning', description: 'reroute' }
    ]
  });
  assert.ok(states(offering).includes('Repriced'));
  assert.ok(offering.final_quote.final_issue_price_usd < offering.initial_quote.final_issue_price_usd);
});

test('BE-4: a critical case never opens — it pauses', () => {
  const offering = simulateOffering(warCase, { payout_speed: 'FAST' });
  assert.equal(offering.final_state, 'Paused');
  assert.ok(!states(offering).includes('Open'));
  assert.equal(offering.subscription.tokens, 0);
});

test('BE-4: subscription never mints more than the recommended supply', () => {
  const offering = simulateOffering(copperCase, { payout_speed: 'FAST', subscription_usd: 99_000_000 });
  assert.ok(offering.subscription.tokens <= offering.initial_quote.recommended_token_supply);
});

test('fund flow: a small order shares the same pro-rata liquidation recovery as the whole book', () => {
  const opts = { payout_speed: 'FAST', settlement: 'IMPORTER_DEFAULT', recovery_rate: 0.45 };
  const whole = simulateOffering(copperCase, opts);
  const small = simulateOffering(copperCase, { ...opts, subscription_usd: 100_000 });
  assert.equal(small.final_state, 'Liquidation');
  assert.equal(small.subscription.offering_tokens_sold, whole.subscription.offering_tokens_sold);
  assert.equal(small.settlement.redemption_value_per_token, whole.settlement.redemption_value_per_token);
  assert.ok(small.settlement.investor_pnl_usd < 0, 'a liquidation below the price paid must lose money for every holder');
});

test('fund flow: escrow is disbursed only once the book is filled', () => {
  const offering = simulateOffering(copperCase, { payout_speed: 'FAST', subscription_usd: 100_000 });
  assert.equal(offering.subscription.book, 'FILLED');
  const funded = offering.steps.find((s) => s.state === 'Funded');
  assert.match(funded.event, /Other investors fill the remaining/u);
  assert.match(offering.steps.find((s) => s.state === 'Subscribed').event, /escrow/u);
});

test('fund flow: an undersubscribed book is cancelled and refunded in full', () => {
  const offering = simulateOffering(copperCase, { payout_speed: 'FAST', subscription_usd: 100_000, book: 'UNDERSUBSCRIBED' });
  assert.equal(offering.final_state, 'Cancelled');
  const seq = states(offering);
  assert.ok(!seq.includes('Funded') && !seq.includes('InTransit'));
  assert.equal(offering.settlement.outcome, 'REFUNDED');
  assert.equal(offering.settlement.investor_proceeds_usd, offering.subscription.raised_usd);
  assert.equal(offering.settlement.investor_pnl_usd, 0);
});

test('fund flow: only RWAOfferingPool states are emitted', () => {
  const runs = [
    simulateOffering(copperCase, { payout_speed: 'FAST' }),
    simulateOffering(copperCase, { payout_speed: 'FAST', settlement: 'IMPORTER_DEFAULT' }),
    simulateOffering(copperCase, { payout_speed: 'FAST', subscription_usd: 1_000, book: 'UNDERSUBSCRIBED' })
  ];
  assert.equal(RWA_OFFERING_STATES.length, 13);
  for (const run of runs) assert.ok(states(run).every((s) => RWA_OFFERING_STATES.includes(s)), states(run).join(','));
});
