import { expect } from 'chai';
import { network } from 'hardhat';

const { ethers } = await network.create();

async function deployUsdc() {
  const [alice, bob, spender] = await ethers.getSigners();
  const usdc = await ethers.deployContract('MockUSDC');
  return { usdc, alice, bob, spender };
}

describe('MockUSDC', () => {
  it('exposes 6-decimal USDC metadata', async () => {
    const { usdc } = await deployUsdc();
    expect(await usdc.decimals()).to.equal(6n);
    expect(await usdc.symbol()).to.equal('mUSDC');
  });

  it('lets anyone mint test balances and transfer them', async () => {
    const { usdc, alice, bob } = await deployUsdc();
    await expect(usdc.connect(alice).mint(alice.address, 1_000_000n))
      .to.emit(usdc, 'Transfer').withArgs(ethers.ZeroAddress, alice.address, 1_000_000n);
    await (await usdc.connect(alice).transfer(bob.address, 400_000n)).wait();
    expect(await usdc.balanceOf(alice.address)).to.equal(600_000n);
    expect(await usdc.balanceOf(bob.address)).to.equal(400_000n);
    expect(await usdc.totalSupply()).to.equal(1_000_000n);
    await expect(usdc.connect(bob).transfer(alice.address, 400_001n)).to.be.revertedWith('balance');
  });

  it('enforces and spends allowances in transferFrom', async () => {
    const { usdc, alice, bob, spender } = await deployUsdc();
    await (await usdc.mint(alice.address, 500n)).wait();
    await expect(usdc.connect(spender).transferFrom(alice.address, bob.address, 1n)).to.be.revertedWith('allowance');
    await (await usdc.connect(alice).approve(spender.address, 300n)).wait();
    await (await usdc.connect(spender).transferFrom(alice.address, bob.address, 200n)).wait();
    expect(await usdc.allowance(alice.address, spender.address)).to.equal(100n);
    expect(await usdc.balanceOf(bob.address)).to.equal(200n);
  });

  it('treats a max allowance as infinite', async () => {
    const { usdc, alice, bob, spender } = await deployUsdc();
    await (await usdc.mint(alice.address, 500n)).wait();
    await (await usdc.connect(alice).approve(spender.address, ethers.MaxUint256)).wait();
    await (await usdc.connect(spender).transferFrom(alice.address, bob.address, 500n)).wait();
    expect(await usdc.allowance(alice.address, spender.address)).to.equal(ethers.MaxUint256);
  });
});
