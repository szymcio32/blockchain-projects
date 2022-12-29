import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

describe('Faucet', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const [owner, signer2] = await ethers.getSigners();
    const withdrawAmount = ethers.utils.parseUnits("0.1", "ether");
    const faucetAmount = ethers.utils.parseUnits("1", "ether");

    const Faucet = await ethers.getContractFactory('Faucet');
    const faucet = await Faucet.deploy({value: faucetAmount});
    await faucet.deployed();

    console.log('Signer 1 address: ', owner.address);
    return { faucet, owner, withdrawAmount, faucetAmount, signer2 };
  }

  it('should deploy and set the owner correctly', async function () {
    const { faucet, owner, faucetAmount } = await loadFixture(deployContractAndSetVariables);

    await expect(await ethers.provider.getBalance(faucet.address)).to.equal(faucetAmount);
    expect(await faucet.owner()).to.equal(owner.address);
  });

  it('should not allow withdraw more than 0.1 ETH', async function () {
    const { faucet, faucetAmount } = await loadFixture(deployContractAndSetVariables);

    await expect(faucet.withdraw(faucetAmount)).to.be.revertedWith("Max amount is 0.1 ether");
  });

  it('should allow withdraw 0.1 ETH', async function () {
    const { faucet, withdrawAmount, signer2 } = await loadFixture(deployContractAndSetVariables);

    await expect(() =>
    faucet.connect(signer2).withdraw(withdrawAmount)
    ).to.changeEtherBalance(faucet.address, ethers.utils.parseUnits("-0.1", "ether"));

    const expectedAmount = ethers.utils.parseUnits("0.9", "ether");
    await expect(await ethers.provider.getBalance(faucet.address)).to.equal(expectedAmount);
  });

  it('should emit Withdraw event', async function () {
    const { faucet, withdrawAmount, signer2 } = await loadFixture(deployContractAndSetVariables);

    await expect(faucet.connect(signer2).withdraw(withdrawAmount))
    .to.emit(faucet, "Withdraw")
    .withArgs(signer2.address, withdrawAmount);
  });

  it('only owner should call destroyFaucet', async function () {
    const { faucet, signer2 } = await loadFixture(deployContractAndSetVariables);

    await expect(faucet.connect(signer2).destroyFaucet()).to.be.reverted;

    await expect(faucet.destroyFaucet()).not.to.be.reverted;
    await expect(await ethers.provider.getCode(faucet.address)).to.equal('0x');
  });

  it('only owner should call withdrawAll', async function () {
    const { faucet, signer2, faucetAmount } = await loadFixture(deployContractAndSetVariables);

    await expect(faucet.connect(signer2).withdrawAll()).to.be.reverted;

    await expect(await ethers.provider.getBalance(faucet.address)).to.equal(faucetAmount);

    await expect(faucet.withdrawAll()).not.to.be.reverted;
    await expect(await ethers.provider.getBalance(faucet.address)).to.equal(0);
  });
});