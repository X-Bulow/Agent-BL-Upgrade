// Investor-side access to the full AgentBL protocol (RWAOfferingPool + RWAToken
// + MockUSDC). The platform operator opens one offering per market case
// (npm run protocol:op -- seed) and records caseId -> poolId under `offerings`
// in chain-config.json; this module reads that mapping and lets a connected
// MetaMask wallet claim test mUSDC, subscribe, redeem and refund.
//
// Amounts on-chain use 6 decimals (USDC and issue prices); everything returned
// to the UI is converted to plain USD numbers and whole RWA.

import { evmSession, loadChainConfig, loadEthers } from './web3.js';

// RWAOfferingPool.OfferingState, in contract enum order.
export const OFFERING_STATES = [
  'Created', 'Priced', 'Open', 'Subscribed', 'Funded', 'InTransit', 'Repriced',
  'Paused', 'Frozen', 'Repaid', 'Redeemed', 'Liquidation', 'Cancelled'
];
const SUBSCRIBABLE_STATES = new Set(['Open', 'Subscribed', 'Repriced']);
const PROTOCOL_CONTRACTS = ['RWAOfferingPool', 'RWAToken', 'MockUSDC'];
const TX_GAS_LIMIT = 600_000n;
const RECEIPT_TIMEOUT_MS = 180_000;

let _readProvider = null;
let _readProviderKey = null;

export function __resetProtocolForTests() {
  _readProvider = null;
  _readProviderKey = null;
}

const isAddress = (value) => typeof value === 'string' && /^0x[0-9a-fA-F]{40}$/u.test(value);
const toUsd = (e6) => Number(e6) / 1e6;

function err(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

/** The offering recorded for `caseId` on the deployed pool, or null (stale mappings are ignored). */
export async function protocolOfferingFor(caseId) {
  const cfg = await loadChainConfig();
  const pool = cfg?.contracts?.RWAOfferingPool;
  const offerings = cfg?.offerings;
  if (!isAddress(pool) || !offerings || String(offerings.pool).toLowerCase() !== pool.toLowerCase()) return null;
  if (!PROTOCOL_CONTRACTS.every((name) => isAddress(cfg.contracts[name]) && Array.isArray(cfg.abis?.[name]))) return null;
  const entry = offerings.cases?.[caseId];
  return entry ? { ...entry, poolId: Number(entry.poolId) } : null;
}

/** Whole RWA a budget buys at an issue price in USD * 1e6. */
export function tokensForBudget(budgetUsd, issuePriceE6) {
  const price = Number(issuePriceE6);
  if (!(price > 0)) return 0;
  return Math.max(0, Math.floor((Number(budgetUsd) || 0) * 1e6 / price));
}

/** Which investor actions the current state and position allow. */
export function availableActions(view) {
  const tokens = view?.position?.tokens ?? 0;
  const paid = view?.position?.paidUsd ?? 0;
  const redeemable = view?.state === 'Repaid' || (view?.state === 'Liquidation' && view?.liquidationSettled);
  return {
    subscribe: SUBSCRIBABLE_STATES.has(view?.state) && !view?.disbursed && view?.subscribed < view?.tokenSupply,
    redeem: Boolean(redeemable && tokens > 0),
    refund: view?.state === 'Cancelled' && paid > 0
  };
}

async function readProvider(cfg) {
  const ethers = await loadEthers();
  if (!_readProvider || _readProviderKey !== cfg.key) {
    _readProvider = new ethers.JsonRpcProvider(cfg.rpcUrls[0], cfg.chainIdDecimal, { staticNetwork: true });
    _readProviderKey = cfg.key;
  }
  return _readProvider;
}

async function contracts(write) {
  const cfg = await loadChainConfig();
  const ethers = await loadEthers();
  let runner;
  if (write) {
    const session = evmSession();
    if (!session) throw err('EVM_WALLET_REQUIRED', 'Connect MetaMask to use the on-chain offering');
    runner = session.signer;
  } else {
    runner = await readProvider(cfg);
  }
  const make = (name) => new ethers.Contract(cfg.contracts[name], cfg.abis[name], runner);
  return { cfg, ethers, pool: make('RWAOfferingPool'), token: make('RWAToken'), usdc: make('MockUSDC') };
}

async function requireOffering(caseId) {
  const offering = await protocolOfferingFor(caseId);
  if (!offering) throw err('NO_OFFERING', `No on-chain offering is recorded for ${caseId}`);
  return offering;
}

/** Pool state plus, when MetaMask is connected, the wallet's position. */
export async function readProtocolOffering(caseId) {
  const offering = await requireOffering(caseId);
  const { pool, token, usdc } = await contracts(false);
  const poolId = BigInt(offering.poolId);
  const [o, fund] = await Promise.all([pool.offerings(poolId), pool.funding(poolId)]);
  const view = {
    caseId,
    poolId: offering.poolId,
    state: OFFERING_STATES[Number(o.state)] ?? `#${o.state}`,
    issuePriceE6: Number(o.issuePrice),
    issuePrice: toUsd(o.issuePrice),
    tokenSupply: Number(o.tokenSupply),
    subscribed: Number(o.subscribed),
    disbursed: fund.disbursed,
    proceedsUsd: toUsd(fund.proceeds),
    liquidationSettled: fund.liquidationSettled,
    position: null
  };

  const session = evmSession();
  if (session) {
    const [tokens, paid, balance] = await Promise.all([
      token.balanceOf(poolId, session.address),
      pool.paidOf(poolId, session.address),
      usdc.balanceOf(session.address)
    ]);
    const outstanding = o.subscribed - fund.redeemedTokens;
    const payout = outstanding > 0n ? (fund.proceeds * tokens) / outstanding : 0n;
    view.position = {
      address: session.address,
      tokens: Number(tokens),
      paidUsd: toUsd(paid),
      usdcBalanceUsd: toUsd(balance),
      estimatedPayoutUsd: availableActions({ ...view, position: { tokens: Number(tokens) } }).redeem ? toUsd(payout) : 0
    };
  }
  return view;
}

function friendlyError(error) {
  if (error?.code === 'ACTION_REJECTED' || error?.code === 4001 || error?.info?.error?.code === 4001) {
    return err('REJECTED', 'The transaction was rejected in the wallet');
  }
  const reason = error?.reason ?? error?.revert?.args?.[0];
  if (reason) return err('REVERTED', reason);
  return error;
}

/** Poll the configured public RPCs for a receipt (wallet RPCs can stall on Injective). */
async function waitForReceipt(cfg, ethers, hash) {
  const providers = cfg.rpcUrls.map((url) => new ethers.JsonRpcProvider(url, cfg.chainIdDecimal, { staticNetwork: true }));
  const deadline = Date.now() + RECEIPT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    for (const provider of providers) {
      const receipt = await provider.getTransactionReceipt(hash).catch(() => null);
      if (receipt) {
        if (receipt.status !== 1) throw err('REVERTED', `Transaction reverted: ${hash}`);
        return receipt;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
  throw err('TIMEOUT', `Timed out waiting for ${hash}`);
}

async function sendAndWait(cfg, ethers, call) {
  let tx;
  try {
    tx = await call({ gasLimit: TX_GAS_LIMIT });
  } catch (error) {
    throw friendlyError(error);
  }
  await waitForReceipt(cfg, ethers, tx.hash);
  return { txHash: tx.hash, explorerUrl: cfg.explorerBase ? `${cfg.explorerBase}/tx/${tx.hash}` : null };
}

/** Testnet faucet: mint mUSDC to the connected wallet. */
export async function claimTestUsdc(amountUsd = 100_000) {
  const { cfg, ethers, usdc } = await contracts(true);
  const session = evmSession();
  const amount = BigInt(Math.round(amountUsd)) * 1_000_000n;
  return sendAndWait(cfg, ethers, (o) => usdc.mint(session.address, amount, o));
}

/**
 * Buy `tokens` RWA at the on-chain issue price, approving mUSDC first when the
 * allowance is short. `onStatus` receives 'approving' and 'subscribing'.
 */
export async function subscribeOnChain(caseId, tokens, { onStatus } = {}) {
  const offering = await requireOffering(caseId);
  const amount = BigInt(Math.floor(Number(tokens) || 0));
  if (amount <= 0n) throw err('INVALID_AMOUNT', 'Choose at least 1 RWA');
  const { cfg, ethers, pool, usdc } = await contracts(true);
  const session = evmSession();
  const poolId = BigInt(offering.poolId);
  const poolAddress = cfg.contracts.RWAOfferingPool;

  const [o, balance, allowance] = await Promise.all([
    pool.offerings(poolId),
    usdc.balanceOf(session.address),
    usdc.allowance(session.address, poolAddress)
  ]);
  const cost = amount * o.issuePrice;
  if (balance < cost) {
    throw err('INSUFFICIENT_USDC', `Need ${toUsd(cost)} mUSDC but the wallet holds ${toUsd(balance)}`);
  }

  let approval = null;
  if (allowance < cost) {
    onStatus?.('approving');
    approval = await sendAndWait(cfg, ethers, (opts) => usdc.approve(poolAddress, cost, opts));
  }
  onStatus?.('subscribing');
  const result = await sendAndWait(cfg, ethers, (opts) => pool.subscribe(poolId, amount, opts));
  return { ...result, approvalTxHash: approval?.txHash ?? null, tokens: Number(amount), costUsd: toUsd(cost) };
}

export async function redeemOnChain(caseId) {
  const offering = await requireOffering(caseId);
  const { cfg, ethers, pool } = await contracts(true);
  return sendAndWait(cfg, ethers, (o) => pool.redeem(BigInt(offering.poolId), o));
}

export async function refundOnChain(caseId) {
  const offering = await requireOffering(caseId);
  const { cfg, ethers, pool } = await contracts(true);
  return sendAndWait(cfg, ethers, (o) => pool.refund(BigInt(offering.poolId), o));
}
