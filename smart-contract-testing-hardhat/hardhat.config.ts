import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as dotEnvConfig } from "dotenv"
import "solidity-coverage";

dotEnvConfig()

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: process.env.GOERLI_RPC_URL || '',
      accounts: process.env.PRIVATE_KEY,
      allowUnlimitedContractSize: true
    }
  },
  solidity: {
    compilers: [{version: "0.8.17"}, {version: "0.8.7"}, {version: "0.6.6"}]
  },
  mocha: {
    timeout: 1000000
  },
};

export default config;
