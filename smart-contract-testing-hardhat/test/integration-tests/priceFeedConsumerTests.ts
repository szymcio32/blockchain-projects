import { ethers } from "hardhat";
import { expect, use } from 'chai';
import { BN } from 'bn.js';
use(require('chai-bn')(BN));
import { Contract, BigNumber } from "ethers";

describe('PriceFeedConsumer Integration Test', function () {
  let priceFeedConsumer: Contract;

  before(async function () {
    const PriceFeedConsumer = await ethers.getContractFactory('PriceFeedConsumer');
    // Aggregator: ETH/USD
    // https://docs.chain.link/getting-started/consuming-data-feeds/
    priceFeedConsumer = await PriceFeedConsumer.deploy('0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e');
    await priceFeedConsumer.deployed();
  });

  it('Price feed greater than 0', async function () {
    const result = await priceFeedConsumer.getLatestPrice()
    const resultValue = BigNumber.from(result._hex).toString();
    expect(resultValue).to.be.a.bignumber.that.is.greaterThan('0');
  });
});