import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as dotenv_config } from 'dotenv';

dotenv_config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: process.env.ALCHEMY_GOERLI_URL || '',
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_KEY
    }
  }

};

export default config;
