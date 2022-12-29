import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

describe('PriceFeedConsumer', function () {
  const DECIMALS = "18"
  const INITIAL_PRICE = ethers.utils.parseUnits('1')

  async function deployContractAndSetVariables() {
    const MockV3Aggregator = await ethers.getContractFactory('MockV3Aggregator');
    const mockV3Aggregator = await MockV3Aggregator.deploy(DECIMALS, INITIAL_PRICE);
    await mockV3Aggregator.deployed();

    const PriceFeedConsumer = await ethers.getContractFactory('PriceFeedConsumer');
    const priceFeedConsumer = await PriceFeedConsumer.deploy(mockV3Aggregator.address);
    await priceFeedConsumer.deployed();

    return { priceFeedConsumer };
  }

  it('should deploy and get the value correctly', async function () {
    const { priceFeedConsumer, } = await loadFixture(deployContractAndSetVariables);

    expect(await priceFeedConsumer.getNumber()).to.equal(BigNumber.from(0));
  });

  it('should set the value correctly', async function () {
    const { priceFeedConsumer } = await loadFixture(deployContractAndSetVariables);

    await priceFeedConsumer.setNumber(50)
    expect(await priceFeedConsumer.getNumber()).to.equal(BigNumber.from(50));
  });

  it('should return the latest price', async function () {
    const { priceFeedConsumer } = await loadFixture(deployContractAndSetVariables);

    expect(await priceFeedConsumer.getLatestPrice()).to.equal(INITIAL_PRICE);
  });
});