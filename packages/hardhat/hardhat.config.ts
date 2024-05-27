import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";

const providerApiKey = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY ?? "";
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

const accounts = [deployerPrivateKey, process.env.TEST_PRIVATE_KEY || ""];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
        runs: 200,
      },
    },
  },
  defaultNetwork: "localhost",
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
      accounts: [
        {
          privateKey: deployerPrivateKey,
          balance: "10000000000000000000000",
        },
        {
          privateKey: process.env.TEST_PRIVATE_KEY || "",
          balance: "10000000000000000000000",
        },
      ],
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts,
      chainId: 11155111,
    },
    polygonMumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${providerApiKey}`,
      accounts,
    },
    base: {
      url: "https://mainnet.base.org",
      accounts,
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts,
    },
    luksoTestnet: {
      url: "https://rpc.testnet.lukso.gateway.fm",
      accounts,
    },
    lukso: {
      url: "https://rpc.lukso.gateway.fm",
      accounts,
    },
  },
  etherscan: {
    apiKey: `${etherscanApiKey}`,
  },
  mocha: {
    timeout: 180000,
  },
};

export default config;
