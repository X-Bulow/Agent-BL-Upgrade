import { expect } from 'chai';
import { network } from 'hardhat';

const { ethers } = await network.create();

const ACTION = { REPRICE: 2, PAUSE: 3, FREEZE: 4, LIQUIDATE: 5, RESUME: 6 };
const STATE = {
  Subscribed: 3n, Funded: 4n, InTransit: 5n, Paused: 7n, Frozen: 8n,
  Repaid: 9n, Redeemed: 10n, Liquidation: 11n, Cancelled: 12n
};
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
  // alice and bob invest; the agent deposits repayments and liquidation proceeds.
  for (const investor of [alice, bob, agent]) {
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

// alice buys `aliceTokens`, bob buys the rest, which funds and disburses the offering.
async function fundOffering(ctx, poolId, aliceTokens, bobTokens) {
  await (await ctx.pool.connect(ctx.alice).subscribe(poolId, aliceTokens)).wait();
  await (await ctx.pool.connect(ctx.bob).subscribe(poolId, bobTokens)).wait();
}

async function repay(ctx, poolId, amount) {
  await (await ctx.pool.connect(ctx.agent).recordImporterPayment(poolId, ethers.id('paid'), amount)).wait();
  await (await ctx.pool.connect(ctx.agent).recordCargoArrival(poolId, ethers.id('arrived'))).wait();
  await (await ctx.pool.connect(ctx.agent).settle(poolId, amount)).wait();
}

async function trigger(ctx, poolId, action, tag) {
  await (await ctx.oracle.updatePricing(poolId, PRICE, 3, action, ethers.id(`${tag}-e`), ethers.id(`${tag}-q`))).wait();
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

  it('settles a repaid offering, releases the eBL and redeems every RWA at the target value', async () => {
    const ctx = await deployStack();
    const { poolId, eblId } = await openOffering(ctx);
    await fundOffering(ctx, poolId, 4n, 6n);
    await (await ctx.pool.connect(ctx.agent).markInTransit(poolId, ethers.id('departed'))).wait();
    const aliceBefore = await ctx.usdc.balanceOf(ctx.alice.address);
    const bobBefore = await ctx.usdc.balanceOf(ctx.bob.address);

    await expect(ctx.pool.connect(ctx.alice).redeem(poolId)).to.be.revertedWith('not redeemable');
    await repay(ctx, poolId, 10_000_000n); // 10 RWA x 1.00 USD
    expect(await ctx.pool.stateOf(poolId)).to.equal(STATE.Repaid);
    expect(await ctx.registry.pledgedTo(eblId)).to.equal(ethers.ZeroAddress);

    await expect(ctx.pool.connect(ctx.alice).redeem(poolId))
      .to.emit(ctx.pool, 'Redeemed').withArgs(poolId, ctx.alice.address, 4n, 4_000_000n);
    expect(await ctx.pool.stateOf(poolId)).to.equal(STATE.Repaid);
    await (await ctx.pool.connect(ctx.bob).redeem(poolId)).wait();
    expect(await ctx.pool.stateOf(poolId)).to.equal(STATE.Redeemed);

    // Each investor paid 0.80 per RWA and received 1.00.
    expect(await ctx.usdc.balanceOf(ctx.alice.address)).to.equal(aliceBefore + 4_000_000n);
    expect(await ctx.usdc.balanceOf(ctx.bob.address)).to.equal(bobBefore + 6_000_000n);
    expect(await ctx.token.totalSupply(poolId)).to.equal(0n);
    expect(await ctx.usdc.balanceOf(await ctx.pool.getAddress())).to.equal(0n);
    await expect(ctx.pool.connect(ctx.alice).redeem(poolId)).to.be.revertedWith('not redeemable');
  });

  it('shares a short repayment pro rata and leaves no rounding dust', async () => {
    const ctx = await deployStack();
    const { poolId } = await openOffering(ctx, 3n);
    await fundOffering(ctx, poolId, 2n, 1n);
    await repay(ctx, poolId, 10n); // deliberately not divisible by 3
    await expect(ctx.pool.connect(ctx.alice).redeem(poolId))
      .to.emit(ctx.pool, 'Redeemed').withArgs(poolId, ctx.alice.address, 2n, 6n);
    await expect(ctx.pool.connect(ctx.bob).redeem(poolId))
      .to.emit(ctx.pool, 'Redeemed').withArgs(poolId, ctx.bob.address, 1n, 4n);
    expect(await ctx.usdc.balanceOf(await ctx.pool.getAddress())).to.equal(0n);
  });

  it('rejects repayments above the target redemption value', async () => {
    const ctx = await deployStack();
    const { poolId } = await openOffering(ctx);
    await fundOffering(ctx, poolId, 4n, 6n);
    await expect(
      ctx.pool.connect(ctx.agent).recordImporterPayment(poolId, ethers.id('paid'), 10_000_001n)
    ).to.be.revertedWith('repayment above target');
  });

  it('distributes liquidation proceeds pro rata once they are deposited', async () => {
    const ctx = await deployStack();
    const { poolId, eblId } = await openOffering(ctx);
    await fundOffering(ctx, poolId, 4n, 6n);
    await trigger(ctx, poolId, ACTION.LIQUIDATE, 'liquidate');
    expect(await ctx.pool.stateOf(poolId)).to.equal(STATE.Liquidation);
    await expect(ctx.pool.connect(ctx.alice).redeem(poolId)).to.be.revertedWith('not redeemable');
    await expect(
      ctx.pool.connect(ctx.alice).recordLiquidationProceeds(poolId, 1n, ethers.id('sale'))
    ).to.be.revertedWith('not executor');

    await expect(ctx.pool.connect(ctx.agent).recordLiquidationProceeds(poolId, 6_000_000n, ethers.id('sale')))
      .to.emit(ctx.pool, 'LiquidationSettled').withArgs(poolId, 6_000_000n, ethers.id('sale'));
    expect(await ctx.registry.pledgedTo(eblId)).to.equal(ethers.ZeroAddress);
    await expect(
      ctx.pool.connect(ctx.agent).recordLiquidationProceeds(poolId, 1n, ethers.id('again'))
    ).to.be.revertedWith('liquidation already settled');

    await expect(ctx.pool.connect(ctx.alice).redeem(poolId))
      .to.emit(ctx.pool, 'Redeemed').withArgs(poolId, ctx.alice.address, 4n, 2_400_000n);
    await expect(ctx.pool.connect(ctx.bob).redeem(poolId))
      .to.emit(ctx.pool, 'Redeemed').withArgs(poolId, ctx.bob.address, 6n, 3_600_000n);
    expect(await ctx.pool.stateOf(poolId)).to.equal(STATE.Liquidation);
  });

  it('lets holders burn their RWA after a total-loss liquidation', async () => {
    const ctx = await deployStack();
    const { poolId } = await openOffering(ctx);
    await fundOffering(ctx, poolId, 4n, 6n);
    await trigger(ctx, poolId, ACTION.LIQUIDATE, 'liquidate');
    await (await ctx.pool.connect(ctx.agent).recordLiquidationProceeds(poolId, 0n, ethers.id('nothing'))).wait();
    await expect(ctx.pool.connect(ctx.alice).redeem(poolId))
      .to.emit(ctx.pool, 'Redeemed').withArgs(poolId, ctx.alice.address, 4n, 0n);
  });

  it('only lets the owner unfreeze, restoring the state before the freeze', async () => {
    const ctx = await deployStack();
    const { poolId } = await openOffering(ctx);
    await fundOffering(ctx, poolId, 4n, 6n);
    await (await ctx.pool.connect(ctx.agent).markInTransit(poolId, ethers.id('departed'))).wait();

    await trigger(ctx, poolId, ACTION.FREEZE, 'freeze');
    expect(await ctx.pool.stateOf(poolId)).to.equal(STATE.Frozen);
    await expect(trigger(ctx, poolId, ACTION.RESUME, 'resume')).to.be.revertedWith('not paused');
    await expect(ctx.pool.connect(ctx.agent).unfreezeOffering(poolId, ethers.id('x'))).to.be.revertedWith('not owner');
    await (await ctx.pool.unfreezeOffering(poolId, ethers.id('cleared'))).wait();
    expect(await ctx.pool.stateOf(poolId)).to.equal(STATE.InTransit);

    // Pause first, then freeze: unfreezing returns to the pre-pause state.
    await trigger(ctx, poolId, ACTION.PAUSE, 'pause');
    await trigger(ctx, poolId, ACTION.FREEZE, 'freeze-2');
    await (await ctx.pool.unfreezeOffering(poolId, ethers.id('cleared-2'))).wait();
    expect(await ctx.pool.stateOf(poolId)).to.equal(STATE.InTransit);
    await expect(ctx.pool.unfreezeOffering(poolId, ethers.id('again'))).to.be.revertedWith('not frozen');
  });

  it('locks RWA transfers until the offering is disbursed', async () => {
    const ctx = await deployStack();
    const { poolId } = await openOffering(ctx);
    await (await ctx.token.setTransferPermission(ctx.alice.address, true)).wait();
    await (await ctx.token.setTransferPermission(ctx.bob.address, true)).wait();
    await (await ctx.pool.connect(ctx.alice).subscribe(poolId, 4n)).wait();
    await expect(ctx.token.connect(ctx.alice).transfer(poolId, ctx.bob.address, 1n)).to.be.revertedWith('transfers locked');
  });

  it('only moves RWA between whitelisted accounts, and the new holder redeems them', async () => {
    const ctx = await deployStack();
    const { poolId } = await openOffering(ctx);
    await fundOffering(ctx, poolId, 4n, 6n);

    await expect(ctx.token.connect(ctx.alice).transfer(poolId, ctx.bob.address, 2n)).to.be.revertedWith('transfer not allowed');
    await (await ctx.token.setTransferPermission(ctx.alice.address, true)).wait();
    await expect(ctx.token.connect(ctx.alice).transfer(poolId, ctx.unfunded.address, 2n))
      .to.be.revertedWith('transfer not allowed');
    await (await ctx.token.setTransferPermission(ctx.bob.address, true)).wait();
    await expect(ctx.token.connect(ctx.alice).transfer(poolId, ctx.bob.address, 2n))
      .to.emit(ctx.token, 'RWATransferred').withArgs(poolId, ctx.alice.address, ctx.bob.address, 2n);
    expect(await ctx.token.balanceOf(poolId, ctx.alice.address)).to.equal(2n);
    expect(await ctx.token.balanceOf(poolId, ctx.bob.address)).to.equal(8n);
    expect(await ctx.token.totalSupply(poolId)).to.equal(10n);

    await repay(ctx, poolId, 10_000_000n);
    await expect(ctx.pool.connect(ctx.bob).redeem(poolId))
      .to.emit(ctx.pool, 'Redeemed').withArgs(poolId, ctx.bob.address, 8n, 8_000_000n);
    await (await ctx.pool.connect(ctx.alice).redeem(poolId)).wait();
    expect(await ctx.pool.stateOf(poolId)).to.equal(STATE.Redeemed);
  });
});
