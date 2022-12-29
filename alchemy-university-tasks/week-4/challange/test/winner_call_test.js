const { expect } = require("chai");

describe("WinnerCall Contract", function () {
  it("msg.sender value should be different then tx.origin", async function () {
    const [owner] = await ethers.getSigners();
    const WinnerContract = await ethers.getContractFactory("WinnerContract");
    const winnerContract = await WinnerContract.deploy();

    const WinnerCall = await ethers.getContractFactory("WinnerCall");
    const winnerCall = await WinnerCall.deploy(winnerContract.address);

    await winnerCall.callWinnerContract();
  });
});