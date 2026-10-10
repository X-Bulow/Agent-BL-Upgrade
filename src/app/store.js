import crypto from 'node:crypto';
import { STATE_BY_PRICING_ACTION, SUBSCRIBABLE_OFFERING_STATES } from '../core/pricingSchema.js';

// In-memory data store for the AgentBL backend.
// Satisfies hackathon requirements for mock persistence without an external DB.
// Pools follow RWAOfferingPool's fund flow: subscriptions are escrowed, a
// partially subscribed pool is 'Subscribed', and reaching the target makes it
// 'Funded' and disburses the escrow to the exporter in one step.

export const storeState = {
  pools: new Map(),
  investments: []
};

export function resetStore() {
  storeState.pools.clear();
  storeState.investments = [];
}

export function createPool(poolId, caseData, quote, options = {}) {
  const createdAt = options.createdAt ?? new Date().toISOString();
  const status = options.status
    ?? STATE_BY_PRICING_ACTION[quote.pricing_action]
    ?? 'Open';
  storeState.pools.set(poolId, {
    poolId,
    caseData,
    quote,
    status,
    subscribedUsd: 0,
    escrowedUsd: 0,
    disbursedUsd: 0,
    targetUsd: quote.requested_cash_usd,
    createdAt,
    quoteUpdatedAt: options.quoteUpdatedAt ?? createdAt,
    complianceStatus: options.complianceStatus ?? 'CLEARED',
    investorEligible: options.investorEligible ?? true
  });
  return storeState.pools.get(poolId);
}

export function subscribeToPool(walletAddress, poolId, amountUsd, options = {}) {
  const pool = storeState.pools.get(poolId);
  if (!pool) throw new Error('Pool not found');
  if (!SUBSCRIBABLE_OFFERING_STATES.includes(pool.status)) {
    throw new Error(`Cannot subscribe to pool in status: ${pool.status}`);
  }
  if (amountUsd <= 0) throw new Error('Subscription amount must be greater than 0');
  if (pool.subscribedUsd + amountUsd > pool.targetUsd) {
    throw new Error('Subscription exceeds target amount');
  }

  pool.subscribedUsd += amountUsd;
  pool.escrowedUsd += amountUsd;

  if (pool.subscribedUsd >= pool.targetUsd) {
    pool.status = 'Funded';
    pool.disbursedUsd = pool.escrowedUsd;
    pool.escrowedUsd = 0;
  } else if (pool.status === 'Open') {
    pool.status = 'Subscribed';
  }

  const txHash = '0x' + crypto.randomBytes(32).toString('hex');
  const tokenCount = amountUsd / (pool.quote.final_issue_price_usd || 1);
  const normalizedWalletAddress = String(walletAddress ?? '').toLowerCase();

  const investment = {
    txHash,
    walletAddress: normalizedWalletAddress,
    poolId,
    amountUsd,
    tokenCount,
    price: pool.quote.final_issue_price_usd,
    yieldBps: pool.quote.implied_gross_yield_bps,
    riskLevel: pool.quote.risk_level,
    label: pool.caseData?.bill_of_lading?.cargo || poolId,
    source: options.source ? structuredClone(options.source) : null,
    timestamp: new Date().toISOString()
  };

  storeState.investments.push(investment);
  return { txHash, investment, poolStatus: pool.status };
}
