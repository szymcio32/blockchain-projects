import { ethers } from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = "0x6C604Cf61097fCCdBA2ac15Fb02964CF0f66EA35";
  const DESTINATION_ADDRESS = "0xA965F26759bBC5DD920c3147243bC913E6b7fc57";
  const AMOUNT = ethers.utils.parseUnits("5", 18);

  const [deployer] = await ethers.getSigners();
  console.log(`Sending ${AMOUNT} tokens to ${DESTINATION_ADDRESS}`);

  const someCoolToken = await hre.ethers.getContractAt("SomeCoolToken", CONTRACT_ADDRESS);
  const sent = await someCoolToken.transfer(DESTINATION_ADDRESS, AMOUNT);
  if (!sent){
    console.log("Failed to send");
  }
  console.log("Tokens have been sent")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
