const hre = require("hardhat");

// WinnerCall contract add on goerli network
const CONTRACT_ADDRESS = '0xb06D2eF15251254d08816573b00568E1cFB41Fb5';

async function main() {
  const winnerCallContract = await hre.ethers.getContractAt("WinnerCall", CONTRACT_ADDRESS);

  console.log(await winnerCallContract.callWinnerContract());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
