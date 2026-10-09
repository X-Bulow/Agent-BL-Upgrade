import assert from 'node:assert/strict';
import test from 'node:test';
import { __resetWeb3ForTests } from '../public/web3.js';
import {
  OFFERING_STATES,
  __resetProtocolForTests,
  availableActions,
  protocolOfferingFor,
  tokensForBudget
} from '../public/protocol.js';

const POOL = '0x2222222222222222222222222222222222222222';
const address = (n) => `0x${String(n).repeat(40)}`;

function registryWith(offerings) {
  return {
    schema: 'agentbl-chain-config-v2',
    defaultNetwork: 'injective-testnet',
    networks: {
      'injective-testnet': {
        chainId: '0x59F', chainIdDecimal: 1439, rpcUrls: ['https://rpc.example'],
        explorerBase: 'https://explorer.example',
        contracts: { RWAOfferingPool: POOL, RWAToken: address(3), MockUSDC: address(4) },
        abis: { RWAOfferingPool: [], RWAToken: [], MockUSDC: [] },
        offerings
      }
    }
  };
}

function serve(registry) {
  globalThis.fetch = async () => ({ ok: true, async json() { return registry; } });
}

test.afterEach(() => {
  __resetWeb3ForTests();
  __resetProtocolForTests();
  delete globalThis.fetch;
});

test('protocol frontend: finds the offering recorded for the deployed pool', async () => {
  serve(registryWith({ pool: POOL, cases: { 'CASE-A': { poolId: '7', issuePriceE6: '850000' } } }));
  const offering = await protocolOfferingFor('CASE-A');
  assert.equal(offering.poolId, 7);
  assert.equal(await protocolOfferingFor('CASE-B'), null);
});

test('protocol frontend: ignores offerings recorded for a previous pool deployment', async () => {
  serve(registryWith({ pool: address(9), cases: { 'CASE-A': { poolId: 1 } } }));
  assert.equal(await protocolOfferingFor('CASE-A'), null);
});

test('protocol frontend: ignores the mapping when protocol ABIs are missing', async () => {
  const registry = registryWith({ pool: POOL, cases: { 'CASE-A': { poolId: 1 } } });
  delete registry.networks['injective-testnet'].abis.MockUSDC;
  serve(registry);
  assert.equal(await protocolOfferingFor('CASE-A'), null);
});

test('protocol frontend: converts a USD budget into whole RWA at the issue price', () => {
  assert.equal(tokensForBudget(1000, 800_000), 1250);
  assert.equal(tokensForBudget(999.99, 800_000), 1249);
  assert.equal(tokensForBudget(1000, 0), 0);
  assert.equal(tokensForBudget(-5, 800_000), 0);
});

test('protocol frontend: enables investor actions by state and position', () => {
  const base = { tokenSupply: 100, subscribed: 10, disbursed: false };
  assert.deepEqual(availableActions({ ...base, state: 'Open' }), { subscribe: true, redeem: false, refund: false });
  assert.equal(availableActions({ ...base, state: 'Paused' }).subscribe, false);
  assert.equal(availableActions({ ...base, state: 'Repriced', disbursed: true }).subscribe, false);
  assert.equal(availableActions({ ...base, state: 'Repaid', position: { tokens: 5 } }).redeem, true);
  assert.equal(availableActions({ ...base, state: 'Repaid', position: { tokens: 0 } }).redeem, false);
  assert.equal(availableActions({ ...base, state: 'Liquidation', position: { tokens: 5 } }).redeem, false);
  assert.equal(
    availableActions({ ...base, state: 'Liquidation', liquidationSettled: true, position: { tokens: 5 } }).redeem,
    true
  );
  assert.equal(availableActions({ ...base, state: 'Cancelled', position: { paidUsd: 8 } }).refund, true);
  assert.equal(OFFERING_STATES[12], 'Cancelled');
});
