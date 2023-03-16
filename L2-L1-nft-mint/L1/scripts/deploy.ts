import { ethers } from "hardhat";

async function main() {
  const name = 'SomeNft';
  const symbol = 'SNFT';
  // You can get latest address of the StarkNet Core Contract Proxy on Goerli by running:
  // starknet get_contract_addresses --network alpha-goerli
  const starknetL1Interface = '0xde29d060D45901Fb19ED6C6e959EB22d8626708e';
  // Follow this link to get details about function selectors:
  // https://docs.starknet.io/documentation/getting_started/l1l2/#receiving-a-message-from-l1
  const functionSelector ='1617454942779701802098857046620118381613320881513907516939351469855446656141';
  // The contract address of deployed L2 contract
  const starknetL2Contract = '0x0191d3844052e8a503e6a37851300aa3073ecda022414d729e77efa48c7884ca';

  const Nft = await ethers.getContractFactory("Nft");
  const nft = await Nft.deploy(name, symbol, starknetL1Interface, functionSelector, starknetL2Contract);

  await nft.deployed();

  console.log(`Nft deployed to ${nft.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
