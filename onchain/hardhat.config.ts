import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import {ethers} from "hardhat";

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: "https://ethereum.blockpi.network/v1/rpc/public",
      }
    },
    eth: {
      url: "https://ethereum.blockpi.network/v1/rpc/public",
      accounts: [process.env.PK!! ?? "0x0000000000000000000000000000000000000000000000000000000000000000"]
    },
    sepolia: {
      url: "https://ethereum-sepolia.blockpi.network/v1/rpc/public",
      accounts: [process.env.PK!! ?? "0x0000000000000000000000000000000000000000000000000000000000000000"]
    }
  },
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
};

export default config;
