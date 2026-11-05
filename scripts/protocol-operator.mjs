/** Platform operator CLI for the AgentBL protocol contracts.
 *
 * Only the pool owner may register eBLs and open offerings, so the platform
 * seeds one on-chain offering per market case and records caseId -> poolId in
 * public/chain-config.json, where the dashboard's market view picks it up.
 * The lifecycle commands move an offering forward for demos.
 *
 *   npm run protocol:op -- seed [--cases ID1,ID2] [--holder 0xExporter]
 *   npm run protocol:op -- status
 *   npm run protocol:op -- fill <caseId>        operator buys the remaining supply (funds + disburses)
 *   npm run protocol:op -- transit <caseId>     mark the cargo in transit
 *   npm run protocol:op -- settle <caseId> [--ratio 1]     deposit repayment, record arrival, settle
 *   npm run protocol:op -- cancel <caseId>      cancel an undisbursed offering (investors refund)
 *   npm run protocol:op -- liquidate <caseId> [--ratio 0.6]  AI liquidation + deposit proceeds
 *
 * Requires DEPLOYER_PRIVATE_KEY (the protocol owner) in the project-root .env.
 * INJECTIVE_RPC_URL overrides the RPC endpoint (e.g. a local node for testing).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ethers } from 'ethers';
import chainConfigLib from './lib/chain-config.cjs';
import { loadDotEnv, requiredEnv } from './lib/injective-live.mjs';
import { compareSpeeds } from '../src/core/pricingEngine.js';
import { normalizeHash32 } from '../src/core/pricingSchema.js';
import { PRICING_ACTION_TO_UINT8, RISK_LEVEL_TO_UINT8 } from '../src/core/contractHarness.js';

const root = path.resolve(import.meta.dirname, '..');
const CONFIG_PATH = path.join(root, 'public', 'chain-config.json');
const CASES_DIR = path.join(root, 'data', 'cases');
const NETWORK_KEY = 'injective-testnet';
const TARGET_REDEMPTION_E6 = 1_000_000n;
const CALL_GAS_LIMIT = 1_000_000n;

// RWAOfferingPool.OfferingState, in contract enum order.
export const OFFERING_STATES = [
  'Created', 'Priced', 'Open', 'Subscribed', 'Funded', 'InTransit', 'Repriced',
  'Paused', 'Frozen', 'Repaid', 'Redeemed', 'Liquidation', 'Cancelled'
];

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const positional = [];
  const flags = {};
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i].startsWith('--')) {
      flags[rest[i].slice(2)] = rest[i + 1];
      i += 1;
    } else {
      positional.push(rest[i]);
    }
  }
  return { command, positional, flags };
}

function hash32(value, fallbackSeed) {
  try {
    return normalizeHash32(value);
  } catch {
    return ethers.id(fallbackSeed);
  }
}

/** The quote the market shows for a case: the recommended payout speed. */
export function marketQuote(caseData) {
  const comparison = compareSpeeds(caseData);
  return comparison.quotes.find((q) => q.payout_speed === comparison.recommended_payout_speed)
    ?? comparison.quotes[0];
}

/** Arguments for createOffering + the oracle's first pricing decision. */
export function offeringTerms(caseData, quote) {
  const issuePriceE6 = BigInt(Math.round(Number(quote.final_issue_price_usd) * 1e6));
  if (issuePriceE6 <= 0n || issuePriceE6 > TARGET_REDEMPTION_E6) {
    throw new Error(`${caseData.case_id}: issue price ${quote.final_issue_price_usd} is outside (0, 1]`);
  }
  return {
    tokenSupply: BigInt(Math.max(1, Math.round(Number(quote.recommended_token_supply) || 0))),
    issuePriceE6,
    targetRedemptionE6: TARGET_REDEMPTION_E6,
    action: PRICING_ACTION_TO_UINT8[quote.pricing_action] ?? 0,
    riskLevel: RISK_LEVEL_TO_UINT8[quote.risk_level] ?? 0,
    quoteHash: hash32(quote.quote_hash, `${caseData.case_id}:quote`),
    evidenceHash: hash32(quote.evidence_hash, `${caseData.case_id}:evidence`)
  };
}

/** EBLRegistry.mintEBLV2 metadata derived from the case's bill of lading / receipt. */
export function eblMetadata(caseData) {
  const bl = caseData.bill_of_lading ?? {};
  const cargo = caseData.cargo ?? {};
  const quantity = Math.max(1, Math.round(Number(cargo.quantity ?? bl.quantity_mt ?? bl.quantity_bbl ?? 1) || 1));
  return {
    cargoHash: ethers.id(`${caseData.case_id}:${bl.bl_id ?? bl.bl_no ?? 'ebl'}`),
    metadataHash: hash32(bl.document_hash, `${caseData.case_id}:metadata`),
    metadata: {
      vessel: String(bl.vessel ?? 'N/A'),
      voyage: String(bl.voyage_no ?? bl.voyage ?? 'N/A'),
      portOfLoading: String(bl.port_of_loading ?? 'N/A'),
      portOfDischarge: String(bl.port_of_discharge ?? 'N/A'),
      cargo: String(bl.cargo ?? cargo.commodity ?? caseData.case_id),
      quantity: BigInt(quantity),
      quantityUnit: String(cargo.unit ?? (bl.quantity_bbl ? 'bbl' : 'MT')),
      hsCode: String(cargo.hs_code ?? bl.hs_code ?? '0000'),
      declaredValueUsdE6: BigInt(Math.round(Number(bl.declared_value_usd ?? 0) * 1e6)),
      incoterms: String(bl.incoterms ?? ''),
      mletr: Boolean(bl.ebl_platform),
      eucp: false,
      dcsa: false
    }
  };
}

async function loadCases() {
  const cases = [];
  for (const name of (await fs.readdir(CASES_DIR)).sort()) {
    if (name.endsWith('.case.json')) cases.push(JSON.parse(await fs.readFile(path.join(CASES_DIR, name), 'utf8')));
  }
  return cases;
}

async function connect() {
  await loadDotEnv(root);
  const registry = chainConfigLib.readRegistry(CONFIG_PATH);
  const cfg = chainConfigLib.resolveNetworkConfig(registry, NETWORK_KEY);
  for (const name of ['EBLRegistry', 'RWAOfferingPool', 'RiskPricingOracle', 'RWAToken', 'MockUSDC']) {
    if (!ethers.isAddress(cfg.contracts[name]) || !Array.isArray(cfg.abis[name])) {
      throw new Error(`${name} is not deployed in chain-config.json; run npm run deploy:protocol first`);
    }
  }
  const rpcUrl = process.env.INJECTIVE_RPC_URL?.trim() || cfg.rpcUrls[0];
  const provider = new ethers.JsonRpcProvider(rpcUrl, cfg.chainIdDecimal, { staticNetwork: true });
  const wallet = new ethers.Wallet(requiredEnv('DEPLOYER_PRIVATE_KEY'), provider);
  const contract = (name) => new ethers.Contract(cfg.contracts[name], cfg.abis[name], wallet);
  let nonce = await provider.getTransactionCount(wallet.address, 'pending');

  // Injective's public RPC can stall on gas estimation and receipts, so use
  // fixed gas, track the nonce locally and poll for the receipt.
  async function send(label, call) {
    const tx = await call({ gasLimit: CALL_GAS_LIMIT, nonce: nonce++ });
    process.stdout.write(`  ${label}: ${tx.hash}`);
    const deadline = Date.now() + 180_000;
    while (Date.now() < deadline) {
      const receipt = await provider.getTransactionReceipt(tx.hash).catch(() => null);
      if (receipt) {
        if (receipt.status !== 1) throw new Error(`\n${label} reverted: ${tx.hash}`);
        process.stdout.write(' ✓\n');
        return receipt;
      }
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
    throw new Error(`\nTimed out waiting for ${label}: ${tx.hash}`);
  }

  return {
    registry, cfg, wallet, send,
    eblRegistry: contract('EBLRegistry'),
    pool: contract('RWAOfferingPool'),
    oracle: contract('RiskPricingOracle'),
    token: contract('RWAToken'),
    usdc: contract('MockUSDC')
  };
}

/** Offerings recorded for the currently deployed pool (stale pools are ignored). */
function recordedOfferings(ctx) {
  const offerings = ctx.cfg.offerings;
  if (!offerings || offerings.pool?.toLowerCase() !== ctx.cfg.contracts.RWAOfferingPool.toLowerCase()) {
    return { pool: ctx.cfg.contracts.RWAOfferingPool, cases: {} };
  }
  return offerings;
}

function writeOfferings(ctx, offerings) {
  ctx.registry = chainConfigLib.mergeNetworkConfig(ctx.registry, NETWORK_KEY, { offerings });
  chainConfigLib.atomicWriteRegistry(CONFIG_PATH, ctx.registry);
}

async function seed(ctx, flags) {
  const only = flags.cases ? new Set(flags.cases.split(',')) : null;
  const holder = flags.holder ? ethers.getAddress(flags.holder) : ctx.wallet.address;
  const offerings = recordedOfferings(ctx);
  const poolAddress = await ctx.pool.getAddress();

  for (const caseData of await loadCases()) {
    const caseId = caseData.case_id;
    if (only && !only.has(caseId)) continue;
    if (offerings.cases[caseId]) {
      console.log(`${caseId}: already pool ${offerings.cases[caseId].poolId}, skipped`);
      continue;
    }
    const quote = marketQuote(caseData);
    const terms = offeringTerms(caseData, quote);
    const ebl = eblMetadata(caseData);
    console.log(`${caseId}: ${quote.payout_speed} ${quote.final_issue_price_usd} x ${terms.tokenSupply} (${quote.pricing_action})`);

    await ctx.send('mintEBLV2', (o) => ctx.eblRegistry.mintEBLV2(ebl.cargoHash, ebl.metadataHash, holder, ebl.metadata, o));
    const eblId = await ctx.eblRegistry.eblIdForCargo(ebl.cargoHash);
    await ctx.send('pledge', (o) => ctx.eblRegistry.pledge(eblId, poolAddress, o));
    await ctx.send('createOffering', (o) =>
      ctx.pool.createOffering(eblId, terms.tokenSupply, terms.issuePriceE6, terms.targetRedemptionE6, o));
    const poolId = (await ctx.pool.nextPoolId()) - 1n;
    await ctx.send('oracle.updatePricing', (o) => ctx.oracle.updatePricing(
      poolId, terms.issuePriceE6, terms.riskLevel, terms.action, terms.evidenceHash, terms.quoteHash, o));

    offerings.cases[caseId] = {
      poolId: Number(poolId),
      eblId: Number(eblId),
      issuePriceE6: terms.issuePriceE6.toString(),
      tokenSupply: terms.tokenSupply.toString(),
      pricingAction: quote.pricing_action,
      payoutSpeed: quote.payout_speed,
      createdAt: new Date().toISOString()
    };
    writeOfferings(ctx, offerings);
  }
  console.log(`Recorded ${Object.keys(offerings.cases).length} offerings in ${CONFIG_PATH}`);
}

function poolIdFor(ctx, caseId) {
  const entry = recordedOfferings(ctx).cases[caseId];
  if (!entry) throw new Error(`No on-chain offering recorded for ${caseId}; run seed first`);
  return BigInt(entry.poolId);
}

async function describe(ctx, poolId) {
  const offering = await ctx.pool.offerings(poolId);
  const funding = await ctx.pool.funding(poolId);
  return {
    state: OFFERING_STATES[Number(offering.state)],
    subscribed: offering.subscribed,
    tokenSupply: offering.tokenSupply,
    issuePriceE6: offering.issuePrice,
    disbursed: funding.disbursed,
    proceeds: funding.proceeds
  };
}

async function status(ctx) {
  const { cases } = recordedOfferings(ctx);
  if (!Object.keys(cases).length) console.log('No offerings recorded for the deployed pool.');
  for (const [caseId, entry] of Object.entries(cases)) {
    const d = await describe(ctx, BigInt(entry.poolId));
    console.log(`${String(entry.poolId).padStart(3)}  ${d.state.padEnd(11)} ${d.subscribed}/${d.tokenSupply} RWA @ ${Number(d.issuePriceE6) / 1e6}  ${d.disbursed ? 'disbursed' : ''}  ${caseId}`);
  }
}

async function fill(ctx, poolId) {
  const d = await describe(ctx, poolId);
  const remaining = d.tokenSupply - d.subscribed;
  if (remaining <= 0n) throw new Error('Offering is already fully subscribed');
  const cost = remaining * d.issuePriceE6;
  const poolAddress = await ctx.pool.getAddress();
  await ctx.send('mUSDC.mint', (o) => ctx.usdc.mint(ctx.wallet.address, cost, o));
  await ctx.send('mUSDC.approve', (o) => ctx.usdc.approve(poolAddress, cost, o));
  await ctx.send('subscribe remaining', (o) => ctx.pool.subscribe(poolId, remaining, o));
}

async function payoutAmount(ctx, poolId, ratio) {
  const d = await describe(ctx, poolId);
  const value = Number(ratio ?? 1);
  if (!(value >= 0 && value <= 1)) throw new Error('--ratio must be between 0 and 1');
  return (d.subscribed * TARGET_REDEMPTION_E6 * BigInt(Math.round(value * 10_000))) / 10_000n;
}

async function deposit(ctx, amount) {
  if (amount === 0n) return;
  await ctx.send('mUSDC.mint', (o) => ctx.usdc.mint(ctx.wallet.address, amount, o));
  const poolAddress = await ctx.pool.getAddress();
  await ctx.send('mUSDC.approve', (o) => ctx.usdc.approve(poolAddress, amount, o));
}

async function settle(ctx, poolId, ratio) {
  const amount = await payoutAmount(ctx, poolId, ratio);
  if (amount === 0n) throw new Error('Repayment must be positive; use liquidate for a total loss');
  await deposit(ctx, amount);
  await ctx.send('recordImporterPayment', (o) => ctx.pool.recordImporterPayment(poolId, ethers.id(`payment:${poolId}`), amount, o));
  await ctx.send('recordCargoArrival', (o) => ctx.pool.recordCargoArrival(poolId, ethers.id(`arrival:${poolId}`), o));
  await ctx.send('settle', (o) => ctx.pool.settle(poolId, amount, o));
}

async function liquidate(ctx, poolId, ratio) {
  const d = await describe(ctx, poolId);
  if (d.state !== 'Liquidation') {
    await ctx.send('oracle TRIGGER_LIQUIDATION', (o) => ctx.oracle.updatePricing(
      poolId, d.issuePriceE6, RISK_LEVEL_TO_UINT8.CRITICAL, PRICING_ACTION_TO_UINT8.TRIGGER_LIQUIDATION,
      ethers.id(`liquidation:${poolId}:evidence`), ethers.id(`liquidation:${poolId}:quote`), o));
  }
  const amount = await payoutAmount(ctx, poolId, ratio ?? 0.6);
  await deposit(ctx, amount);
  await ctx.send('recordLiquidationProceeds', (o) =>
    ctx.pool.recordLiquidationProceeds(poolId, amount, ethers.id(`liquidation:${poolId}:proceeds`), o));
}

async function main() {
  const { command, positional, flags } = parseArgs(process.argv.slice(2));
  const commands = ['seed', 'status', 'fill', 'transit', 'settle', 'cancel', 'liquidate'];
  if (!commands.includes(command)) {
    console.log(`Usage: npm run protocol:op -- <${commands.join('|')}> [caseId] [--flags]`);
    process.exitCode = 1;
    return;
  }
  const ctx = await connect();
  console.log(`Operator ${ctx.wallet.address} on ${ctx.cfg.displayName} (pool ${ctx.cfg.contracts.RWAOfferingPool})`);
  if (command === 'seed') return seed(ctx, flags);
  if (command === 'status') return status(ctx);

  const poolId = poolIdFor(ctx, positional[0]);
  if (command === 'fill') await fill(ctx, poolId);
  if (command === 'transit') await ctx.send('markInTransit', (o) => ctx.pool.markInTransit(poolId, ethers.id(`departure:${poolId}`), o));
  if (command === 'settle') await settle(ctx, poolId, flags.ratio);
  if (command === 'cancel') await ctx.send('cancelOffering', (o) => ctx.pool.cancelOffering(poolId, ethers.id(`cancel:${poolId}`), o));
  if (command === 'liquidate') await liquidate(ctx, poolId, flags.ratio);
  console.log(`Pool ${poolId} is now ${(await describe(ctx, poolId)).state}`);
}

/** The contract's revert reason when there is one, otherwise the error message. */
export function revertReason(error) {
  if (error?.reason) return error.reason;
  const text = `${error?.message ?? ''} ${JSON.stringify(error?.info ?? error?.error ?? '')}`;
  const match = text.match(/reverted with reason string '([^']+)'/u) ?? text.match(/execution reverted: ([^"\\]+)/u);
  return match ? match[1] : (error?.shortMessage ?? error?.message ?? String(error));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`\nFailed: ${revertReason(error)}`);
    process.exitCode = 1;
  });
}
