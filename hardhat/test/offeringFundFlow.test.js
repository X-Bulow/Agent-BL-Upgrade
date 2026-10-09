import { expect } from 'chai';
import { network } from 'hardhat';

const { ethers } = await network.create();

const ACTION = { REPRICE: 2 };
const STATE = { Subscribed: 3n, Funded: 4n, InTransit: 5n, Cancelled: 12n };
const PRICE = 800_000n; // 0.80 USD per RWA, 6 decimals

async function deployStack() {
  const [owner, exporter, alice, bob, agent, unfunded] = await ethers.getSigners();
  const registry = await ethers.deployContract('EBLRegistry');
  const token = await ethers.deployContract('RWAToken');
  const usdc = await ethers.deployContract('MockUSDC');
  const pool = await ethers.deployContract('RWAOfferingPool', [
    await registry.getAddress(), await token.getAddress(), await usdc.getAddress()
  ]);
  const oracle = await ethers.deployContract('RiskPricingOracle', [await pool.getAddress()]);
  await (await token.setPool(await pool.getAddress())).wait();
  await (await pool.setOracle(await oracle.getAddress())).wait();
  await (await pool.setAgentExecutor(agent.address, true)).wait();
  for (const investor of [alice, bob]) {
    await (await usdc.mint(investor.address, 1_000_000_000n)).wait();
    await (await usdc.connect(investor).approve(await pool.getAddress(), ethers.MaxUint256)).wait();
  }
  return { owner, exporter, alice, bob, agent, unfunded, registry, token, usdc, pool, oracle };
}

// The exporter holds and pledges the eBL; the platform owner opens the offering.
async function openOffering(ctx, supply = 10n) {
  await (await ctx.registry.mintEBL(ethers.id(`ebl-${supply}`), ctx.exporter.address)).wait();
  const eblId = (await ctx.registry.nextEblId()) - 1n;
  await (await ctx.registry.connect(ctx.exporter).pledge(eblId, await ctx.pool.getAddress())).wait();
  await (await ctx.pool.createOffering(eblId, supply, PRICE, 1_000_000n)).wait();
  return { poolId: (await ctx.pool.nextPoolId()) - 1n, eblId };
}

describe('RWAOfferingPool fund flow', () => {
  it('escrows subscriptions and disburses everything to the exporter once fully subscribed', async () => {
    const ctx = await deployStack();
    const { poolId } = await openOffering(ctx);
    const poolAddress = await ctx.pool.getAddress();

    await (await ctx.pool.connect(ctx.alice).subscribe(poolId, 4n)).wait();
    expect(await ctx.pool.stateOf(poolId)).to.equal(STATE.Subscribed);
    expect(await ctx.usdc.balanceOf(poolAddress)).to.equal(4n * PRICE);
    expect(await ctx.usdc.balanceOf(ctx.exporter.address)).to.equal(0n);
    expect(await ctx.pool.paidOf(poolId, ctx.alice.address)).to.equal(4n * PRICE);

    await expect(ctx.pool.connect(ctx.bob).subscribe(poolId, 6n))
      .to.emit(ctx.pool, 'FundsDisbursed').withArgs(poolId, ctx.exporter.address, 10n * PRICE);
    expect(await ctx.pool.stateOf(poolId)).to.equal(STATE.Funded);
    expect(await ctx.usdc.balanceOf(poolAddress)).to.equal(0n);
    expect(await ctx.usdc.balanceOf(ctx.exporter.address)).to.equal(10n * PRICE);
    const funding = await ctx.pool.funding(poolId);
    expect(funding.disbursed).to.equal(true);
    expect(funding.escrowed).to.equal(0n);
    await expect(ctx.pool.connect(ctx.alice).subscribe(poolId, 1n)).to.be.revertedWith('not open');
  });

  it('charges the issue price in force at the time of each subscription', async () => {
    const ctx = await deployStack();
    const { poolId } = await openOffering(ctx);
    await (await ctx.pool.connect(ctx.alice).subscribe(poolId, 5n)).wait();
    await (await ctx.oracle.updatePricing(poolId, 750_000n, 2, ACTION.REPRICE, ethers.id('e'), ethers.id('q'))).wait();
    await (await ctx.pool.connect(ctx.bob).subscribe(poolId, 5n)).wait();
    expect(await ctx.pool.paidOf(poolId, ctx.alice.address)).to.equal(5n * PRICE);
    expect(await ctx.pool.paidOf(poolId, ctx.bob.address)).to.equal(5n * 750_000n);
    expect(await ctx.usdc.balanceOf(ctx.exporter.address)).to.equal(5n * PRICE + 5n * 750_000n);
  });

  it('rejects a subscription the investor has not paid for', async () => {
    const ctx = await deployStack();
    const { poolId } = await openOffering(ctx);
    await expect(ctx.pool.connect(ctx.unfunded).subscribe(poolId, 1n)).to.be.revertedWith('payment failed');
    expect(await ctx.token.balanceOf(poolId, ctx.unfunded.address)).to.equal(0n);
  });

  it('only marks a disbursed offering in transit', async () => {
    const ctx = await deployStack();
    const { poolId } = await openOffering(ctx);
    await (await ctx.pool.connect(ctx.alice).subscribe(poolId, 9n)).wait();
    await expect(ctx.pool.connect(ctx.agent).markInTransit(poolId, ethers.id('departed'))).to.be.revertedWith('not funded');
    await (await ctx.pool.connect(ctx.alice).subscribe(poolId, 1n)).wait();
    await (await ctx.pool.connect(ctx.agent).markInTransit(poolId, ethers.id('departed'))).wait();
    expect(await ctx.pool.stateOf(poolId)).to.equal(STATE.InTransit);
  });

  it('cancels an undersubscribed offering, releases the eBL and refunds exactly what each investor paid', async () => {
    const ctx = await deployStack();
    const { poolId, eblId } = await openOffering(ctx);
    await (await ctx.pool.connect(ctx.alice).subscribe(poolId, 3n)).wait();
    await (await ctx.oracle.updatePricing(poolId, 700_000n, 2, ACTION.REPRICE, ethers.id('e'), ethers.id('q'))).wait();
    await (await ctx.pool.connect(ctx.bob).subscribe(poolId, 2n)).wait();
    const aliceBefore = await ctx.usdc.balanceOf(ctx.alice.address);
    const bobBefore = await ctx.usdc.balanceOf(ctx.bob.address);

    await expect(ctx.pool.connect(ctx.alice).refund(poolId)).to.be.revertedWith('not cancelled');
    await expect(ctx.pool.connect(ctx.agent).cancelOffering(poolId, ethers.id('x'))).to.be.revertedWith('not owner');
    await expect(ctx.pool.cancelOffering(poolId, ethers.id('undersubscribed')))
      .to.emit(ctx.pool, 'OfferingCancelled').withArgs(poolId, ethers.id('undersubscribed'));
    expect(await ctx.pool.stateOf(poolId)).to.equal(STATE.Cancelled);
    expect(await ctx.registry.pledgedTo(eblId)).to.equal(ethers.ZeroAddress);

    await expect(ctx.pool.connect(ctx.alice).refund(poolId))
      .to.emit(ctx.pool, 'Refunded').withArgs(poolId, ctx.alice.address, 3n * PRICE, 3n);
    await (await ctx.pool.connect(ctx.bob).refund(poolId)).wait();
    expect(await ctx.usdc.balanceOf(ctx.alice.address)).to.equal(aliceBefore + 3n * PRICE);
    expect(await ctx.usdc.balanceOf(ctx.bob.address)).to.equal(bobBefore + 2n * 700_000n);
    expect(await ctx.token.balanceOf(poolId, ctx.alice.address)).to.equal(0n);
    expect(await ctx.token.totalSupply(poolId)).to.equal(0n);
    expect(await ctx.usdc.balanceOf(await ctx.pool.getAddress())).to.equal(0n);
    await expect(ctx.pool.connect(ctx.alice).refund(poolId)).to.be.revertedWith('nothing to refund');
  });

  it('cannot cancel an offering whose funds were already disbursed', async () => {
    const ctx = await deployStack();
    const { poolId } = await openOffering(ctx);
    await (await ctx.pool.connect(ctx.alice).subscribe(poolId, 10n)).wait();
    await expect(ctx.pool.cancelOffering(poolId, ethers.id('late'))).to.be.revertedWith('already disbursed');
  });

  it('only lets the pool burn RWA', async () => {
    const ctx = await deployStack();
    const { poolId } = await openOffering(ctx);
    await (await ctx.pool.connect(ctx.alice).subscribe(poolId, 1n)).wait();
    await expect(ctx.token.connect(ctx.alice).burn(poolId, ctx.alice.address, 1n)).to.be.revertedWith('only pool');
  });
});
