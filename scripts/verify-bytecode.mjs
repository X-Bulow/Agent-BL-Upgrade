#!/usr/bin/env node
/**
 * Compare the contracts deployed on-chain with the local Hardhat build (read-only:
 * it only calls eth_getCode).
 *
 *   npm run verify:bytecode                 report for the default network
 *   npm run verify:bytecode -- --strict     exit 1 unless every deployed contract matches the source
 *   npm run verify:bytecode -- --json       machine-readable report
 *   npm run verify:bytecode -- --network injective-mainnet
 *
 * Build the artifacts first: `cd hardhat && npm run compile`.
 *
 * Why it exists: the addresses in public/chain-config.json point at whatever was deployed
 * at the time. When a contract changes, the source and the live deployment diverge until
 * it is redeployed, and nothing else flags that.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import chainConfig from './lib/chain-config.cjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'public', 'chain-config.json');
const ARTIFACTS = path.join(ROOT, 'hardhat', 'artifacts', 'contracts');

/** Solidity appends a CBOR metadata blob; its byte length is in the last two bytes. */
export function stripMetadata(hex) {
  const code = String(hex ?? '').toLowerCase().replace(/^0x/u, '');
  if (code.length < 4) return code;
  const metadataBytes = Number.parseInt(code.slice(-4), 16);
  const trailer = (metadataBytes + 2) * 2;
  return trailer < code.length ? code.slice(0, code.length - trailer) : code;
}

/**
 * @returns {'MATCH'|'MATCH_METADATA'|'DIFFERENT'|'NOT_DEPLOYED'}
 *   MATCH_METADATA: identical code, only the compiler metadata hash differs.
 */
export function compareBytecode(localHex, remoteHex) {
  const local = String(localHex ?? '').toLowerCase().replace(/^0x/u, '');
  const remote = String(remoteHex ?? '').toLowerCase().replace(/^0x/u, '');
  if (!remote) return 'NOT_DEPLOYED';
  if (local === remote) return 'MATCH';
  return stripMetadata(local) === stripMetadata(remote) ? 'MATCH_METADATA' : 'DIFFERENT';
}

export function loadLocalBytecode(name, artifactsDir = ARTIFACTS) {
  const file = path.join(artifactsDir, `${name}.sol`, `${name}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8')).deployedBytecode ?? null;
}

async function rpcCall(urls, method, params) {
  let lastError;
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: AbortSignal.timeout(15_000)
      });
      const body = await response.json();
      if (body.error) throw new Error(`${method}: ${body.error.message}`);
      return body.result;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('no RPC URL configured');
}

const ICON = { MATCH: '✓', MATCH_METADATA: '✓', DIFFERENT: '✗', NOT_DEPLOYED: '✗', NO_ARTIFACT: '?' };
const LABEL = {
  MATCH: 'matches the local build',
  MATCH_METADATA: 'matches (only the compiler metadata hash differs)',
  DIFFERENT: 'DIFFERS from the local source: the deployment is older (or newer) than the code',
  NOT_DEPLOYED: 'no contract code at this address',
  NO_ARTIFACT: 'no local artifact (run: cd hardhat && npm run compile)'
};

export async function verifyDeployment({ network, configPath = CONFIG_PATH, artifactsDir = ARTIFACTS, getCode = rpcCall } = {}) {
  const config = chainConfig.resolveNetworkConfig(chainConfig.readRegistry(configPath), network);
  const results = [];
  for (const [name, address] of Object.entries(config.contracts)) {
    const local = loadLocalBytecode(name, artifactsDir);
    if (!local) {
      results.push({ name, address, status: 'NO_ARTIFACT' });
      continue;
    }
    const remote = await getCode(config.rpcUrls, 'eth_getCode', [address, 'latest']);
    results.push({ name, address, status: compareBytecode(local, remote) });
  }
  return { network: config.key, chainId: config.chainIdDecimal, results };
}

async function main() {
  const args = process.argv.slice(2);
  const option = (flag) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const report = await verifyDeployment({ network: option('--network') });
  const stale = report.results.filter((entry) => !['MATCH', 'MATCH_METADATA'].includes(entry.status));

  if (args.includes('--json')) {
    console.log(JSON.stringify({ ...report, upToDate: stale.length === 0 }, null, 2));
  } else {
    console.log(`Network ${report.network} (chain ${report.chainId})`);
    for (const entry of report.results) {
      console.log(`  ${ICON[entry.status]} ${entry.name.padEnd(20)} ${entry.address}  ${LABEL[entry.status]}`);
    }
    console.log(stale.length === 0
      ? '\nEvery deployed contract matches the local build.'
      : `\n${stale.length} of ${report.results.length} deployed contract(s) differ from the local source. `
        + 'Redeploy to put the current source on-chain: cd hardhat && npm run deploy:all');
  }
  if (args.includes('--strict') && stale.length > 0) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`verify:bytecode failed: ${error.message}`);
    process.exitCode = 2;
  });
}
