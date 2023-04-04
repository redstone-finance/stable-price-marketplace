import { HardhatUserConfig } from "hardhat/config";
import fs from "fs";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    local: {
      url: "http://localhost:8545",
      chainId: 1337,
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      gasPrice: 225000000000,
      chainId: 43113,
      accounts: tryGetPrivateKeys(),
    },
  },
};

function tryGetPrivateKeys() {
  const secretsFilePath = "./.private-keys.json";
  if (fs.existsSync(secretsFilePath)) {
    const fileContent = fs.readFileSync(secretsFilePath, "utf-8");
    return JSON.parse(fileContent);
  } else {
    return [];
  }
}

export default config;
