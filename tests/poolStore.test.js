import assert from 'node:assert/strict';
import test from 'node:test';
import { createPool, resetStore, storeState, subscribeToPool } from '../src/app/store.js';
import { evaluateMysteryCandidate, normalizeRiskPassport } from '../src/mystery/policy.js';
import { SUBSCRIBABLE_OFFERING_STATES } from '../src/core/pricingSchema.js';

const quote = {
  requested_cash_usd: 1_000,
  final_issue_price_usd: 0.8,
  implied_gross_yield_bps: 2500,
  risk_level: 'LOW',
  pricing_action: 'OPEN_OFFERING'
};

test.beforeEach(() => resetStore());

test('pool store: a partial subscription escrows funds and marks the pool Subscribed', () => {
  createPool('pool-a', {}, quote);
  const { poolStatus } = subscribeToPool('0xAlice', 'pool-a', 400);
  const pool = storeState.pools.get('pool-a');
  assert.equal(poolStatus, 'Subscribed');
  assert.equal(pool.escrowedUsd, 400);
  assert.equal(pool.disbursedUsd, 0);
});

test('pool store: a Subscribed pool keeps accepting subscriptions until it funds and disburses', () => {
  createPool('pool-a', {}, quote);
  subscribeToPool('0xAlice', 'pool-a', 400);
  const { poolStatus } = subscribeToPool('0xBob', 'pool-a', 600);
  const pool = storeState.pools.get('pool-a');
  assert.equal(poolStatus, 'Funded');
  assert.equal(pool.escrowedUsd, 0);
  assert.equal(pool.disbursedUsd, 1_000);
  assert.throws(() => subscribeToPool('0xCarol', 'pool-a', 1), /Cannot subscribe to pool in status: Funded/u);
});

test('pool store: a repriced pool stays Repriced while it fills', () => {
  createPool('pool-r', {}, { ...quote, pricing_action: 'REPRICE_DOWN' });
  assert.equal(subscribeToPool('0xAlice', 'pool-r', 100).poolStatus, 'Repriced');
});

test('pool store: subscribable states match RWAOfferingPool.subscribe', () => {
  assert.deepEqual(SUBSCRIBABLE_OFFERING_STATES, ['Open', 'Subscribed', 'Repriced']);
});

test('mystery policy: a partially subscribed pool is still an eligible candidate', () => {
  const now = '2026-07-23T00:30:00.000Z';
  const pool = {
    poolId: 'pool-s',
    status: 'Subscribed',
    targetUsd: 100_000,
    subscribedUsd: 40_000,
    investorEligible: true,
    complianceStatus: 'CLEARED',
    quote: {
      quote_hash: `0x${'a'.repeat(64)}`,
      risk_score_bps: 400,
      stress_loss_pct: 0.2,
      ai_verified_collateral_value_usd: 125,
      target_redemption_exposure_usd: 100
    },
    quoteUpdatedAt: '2026-07-23T00:00:00.000Z',
    caseData: { bill_of_lading: {}, exporter: {}, importer: {} }
  };
  const result = evaluateMysteryCandidate(pool, normalizeRiskPassport({ tier: 'BALANCED' }), { now });
  assert.equal(result.eligible, true, JSON.stringify(result.reasons));
});
