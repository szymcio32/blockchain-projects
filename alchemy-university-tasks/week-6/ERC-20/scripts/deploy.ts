import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const SomeCoolToken = await ethers.getContractFactory("SomeCoolToken");
  const someCoolToken = await SomeCoolToken.deploy();

  await someCoolToken.deployed();

  console.log("SomeCoolToken address:", someCoolToken.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
