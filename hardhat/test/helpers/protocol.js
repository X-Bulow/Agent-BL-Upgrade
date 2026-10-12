// Shared fixtures for the protocol hardening tests.
import { network } from 'hardhat';

export const { ethers } = await network.create();

/** RWAOfferingPool.OfferingState enum indices. */
export const STATE = Object.freeze({
  Created: 0n,
  Priced: 1n,
  Open: 2n,
  Subscribed: 3n,
  Funded: 4n,
  InTransit: 5n,
  Repriced: 6n,
  Paused: 7n,
  Frozen: 8n,
  Repaid: 9n,
  Redeemed: 10n,
  Liquidation: 11n,
  Cancelled: 12n
});

/** Pricing action codes understood by RWAOfferingPool.applyPricingAction. */
export const ACTION = Object.freeze({
  OPEN_OFFERING: 0,
  OPEN_WITH_WARNING: 1,
  REPRICE_DOWN: 2,
  PAUSE_OFFERING: 3,
  FREEZE_POOL: 4,
  TRIGGER_LIQUIDATION: 5,
  RESUME_OFFERING: 6,
  SETTLE_OFFERING: 7,
  EMERGENCY_PAUSE: 8,
  CANCEL_OFFERING: 9
});

export const TARGET = 1_000_000n;
export const ISSUE_PRICE = 800_000n;

/** Wait for a transaction promise to be mined. */
export async function send(transaction) {
  return (await transaction).wait();
}

let hashCounter = 0;
/** A fresh, never-before-used bytes32 (every oracle decision must be unique). */
export function uniqueHash(label = 'h') {
  hashCounter += 1;
  return ethers.id(`${label}:${hashCounter}`);
}

/**
 * Deploy and wire the whole protocol: EBLRegistry, RWAToken, RWAOfferingPool,
 * RiskPricingOracle and an (unattached) InvestorComplianceGate. `agent` is an
 * authorised executor; the owner is also the oracle's first updater.
 */
export async function deployProtocol() {
  const [owner, investor, outsider, agent, other, third] = await ethers.getSigners();
  const deploy = async (name, ...args) => {
    const contract = await (await ethers.getContractFactory(name)).deploy(...args);
    await contract.waitForDeployment();
    return contract;
  };
  const registry = await deploy('EBLRegistry');
  const token = await deploy('RWAToken');
  const pool = await deploy('RWAOfferingPool', await registry.getAddress(), await token.getAddress());
  const oracle = await deploy('RiskPricingOracle', await pool.getAddress());
  const gate = await deploy('InvestorComplianceGate');
  await send(token.setPool(await pool.getAddress()));
  await send(pool.setOracle(await oracle.getAddress()));
  await send(pool.setAgentExecutor(agent.address, true));
  return { owner, investor, outsider, agent, other, third, registry, token, pool, oracle, gate };
}

/** Mint an eBL, pledge it to the pool and open an offering on it. */
export async function newOffering(ctx, tag, { supply = 100n, issuePrice = ISSUE_PRICE, target = TARGET } = {}) {
  await send(ctx.registry.mintEBL(ethers.id(`metadata:${tag}`), ctx.owner.address));
  const eblId = (await ctx.registry.nextEblId()) - 1n;
  await send(ctx.registry.pledge(eblId, await ctx.pool.getAddress()));
  await send(ctx.pool.createOffering(eblId, supply, issuePrice, target));
  return { eblId, poolId: (await ctx.pool.nextPoolId()) - 1n };
}

/** Push one pricing decision through the oracle (unique evidence/quote hashes). */
export function applyPricing(ctx, poolId, price, action, riskLevel = 1) {
  return ctx.oracle.updatePricing(poolId, price, riskLevel, action, uniqueHash('evidence'), uniqueHash('quote'));
}

/** Drive an offering through proofs and settlement as the executor. */
export async function settleOffering(ctx, poolId, amount, tag = 'settle') {
  const agent = ctx.pool.connect(ctx.agent);
  await send(agent.recordImporterPayment(poolId, ethers.id(`${tag}:payment`), amount));
  await send(agent.recordCargoArrival(poolId, ethers.id(`${tag}:arrival`)));
  return send(agent.settle(poolId, amount));
}
