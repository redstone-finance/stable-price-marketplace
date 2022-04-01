const fs = require("fs");
require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

function tryGetPrivateKeys() {
  const secretsFilePath = "./.private-keys.json";
  if (fs.existsSync(secretsFilePath)) {
    const fileContent = fs.readFileSync(secretsFilePath);
    return JSON.parse(fileContent);
  } else {
    return [];
  }
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "hardhat",
  networks: {
    local: {
      url: "http://localhost:8545",
      chainId: 31337,
    },
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      gasPrice: 225000000000,
      chainId: 44787,
      accounts: tryGetPrivateKeys()
    }
  }
};
