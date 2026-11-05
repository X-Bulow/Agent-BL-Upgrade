/**
 * Deploy AgentBLRWA (the self-contained demo contract that the browser
 * dashboard drives via MetaMask) to the target network, then wire the deployed
 * address + ABI straight into the frontend by overwriting public/chain-config.json.
 *
 * After this runs, View ① "Mint RWA on-chain" produces a REAL on-chain tx.
 * Until it runs, public/chain-config.json carries an empty address and the
 * frontend uses its high-fidelity simulated fallback.
 *
 * Supported networks:
 *   injective_testnet — Injective Testnet (inEVM, chainId 1439)
 *
 * Required in project-root .env:
 *   DEPLOYER_PRIVATE_KEY=0x...
 *   INJECTIVE_RPC_URL=https://k8s.testnet.json-rpc.injective.network  (for Injective)
 *
 * Run:
 *   npm run deploy:injective      (Injective Testnet)
 */
import fs from 'node:fs';
import path from 'node:path';
import hre from 'hardhat';
import chainConfig from '../../scripts/lib/chain-config.cjs';

const { artifacts } = hre;
const { ethers, networkName } = await hre.network.create();

const NETWORK_META = {
  injective_testnet: {
    name: 'injective_testnet',
    explorerBase: 'https://testnet.blockscout.injective.network',
    explorerAddressPath: '/address/',
    explorerTxPath: '/tx/',
    gasToken: 'INJ'
  }
};

const SUPPORTED = Object.keys(NETWORK_META);

async function main() {
  if (!SUPPORTED.includes(networkName)) {
    throw new Error(
      `Refusing to deploy on "${networkName}".\n` +
      `  Use: npm run deploy:injective  (Injective Testnet)`
    );
  }

  const meta = NETWORK_META[networkName];
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(`\n🌐 Network: ${meta.name}`);
  console.log(`⛽ Gas token: ${meta.gasToken}`);
  console.log(`👤 Deployer : ${deployer.address}`);
  console.log(`💰 Balance  : ${ethers.formatEther(balance)} ${meta.gasToken}`);

  if (balance === 0n) {
    if (networkName === 'injective_testnet') {
      console.log('💧 Get testnet INJ from: https://testnet.faucet.injective.network/');
    }
    throw new Error(`Deployer balance is 0 ${meta.gasToken}. Fund the wallet first.`);
  }

  const Factory = await ethers.getContractFactory('AgentBLRWA');
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const deployTx = contract.deploymentTransaction()?.hash ?? null;
  const chainId = (await ethers.provider.getNetwork()).chainId;
  const { abi } = await artifacts.readArtifact('AgentBLRWA');

  console.log('\n✅ AgentBLRWA deployed');
  console.log('   Address:', address);
  console.log('   Tx:     ', deployTx);

  // 1) Frontend-readable config (served statically at /chain-config.json).
  const frontendPath = path.join(import.meta.dirname, '..', '..', 'public', 'chain-config.json');
  const current = chainConfig.readRegistry(frontendPath);
  const merged = chainConfig.mergeNetworkConfig(current, 'injective-testnet', {
    network: meta.name,
    chainId: '0x' + chainId.toString(16),
    chainIdDecimal: Number(chainId),
    rpcUrls: [process.env.INJECTIVE_RPC_URL || 'https://k8s.testnet.json-rpc.injective.network/'],
    explorerBase: meta.explorerBase,
    contracts: { AgentBLRWA: address },
    abis: { AgentBLRWA: abi },
    deployments: { AgentBLRWA: { address, deployTx, deployedAt: new Date().toISOString() } }
  });
  chainConfig.atomicWriteRegistry(frontendPath, merged);
  console.log('📄 Frontend config ->', frontendPath);

  // 2) Deployment record.
  const outDir = path.join(import.meta.dirname, '..', 'deployments');
  fs.mkdirSync(outDir, { recursive: true });
  const recordFilename = `${meta.name}-agentbl.json`;
  const recordPath = path.join(outDir, recordFilename);
  fs.writeFileSync(recordPath, JSON.stringify({
    network: meta.name,
    chainId: Number(chainId),
    deployer: deployer.address,
    contract: 'AgentBLRWA',
    address,
    deployTx,
    explorer: `${meta.explorerBase}${meta.explorerAddressPath}${address}`,
    deployedAt: merged.networks['injective-testnet'].deployments.AgentBLRWA.deployedAt
  }, null, 2));
  console.log('📄 Deployment record ->', recordPath);

  console.log(`\n🎯 Done. The dashboard will now mint real ${meta.gasToken} txs on ${meta.name}.`);
  console.log(`   Explorer: ${meta.explorerBase}${meta.explorerAddressPath}${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
