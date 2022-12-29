const hre = require("hardhat");

async function main() {
  const WinnerCall = await hre.ethers.getContractFactory("WinnerCall");
  // Contract address https://goerli.etherscan.io/address/0xcF469d3BEB3Fc24cEe979eFf83BE33ed50988502#code
  const winnerCall = await WinnerCall.deploy('0xcF469d3BEB3Fc24cEe979eFf83BE33ed50988502');

  await winnerCall.deployed();

  console.log(
    `winnerCall deployed to ${winnerCall.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
