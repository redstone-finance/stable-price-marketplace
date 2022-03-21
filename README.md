# Stable price NFT marketplace (powered by RedStone oracles)

This is an example implementation of an NFT marketplace with stable price support powered by RedStone oracles.
TODO: add more description

## Tutorial

### 1. Init solidity project
```sh
yarn init
yarn add hardhat --dev
npx harhat
```

### 2. Implement NFT and marketplace contracts
#### Install openzeppelin module
TODO: describe shortly what is openzeppelin
```sh
yarn add @openzeppelin/contracts --dev
```

#### Add an example NFT contract
```js
// File: contracts/ExampleNFT.sol

// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ExampleNFT is ERC721 {
    constructor() ERC721("ExampleNFT", "ENFT") {}
}
```

#### Implement marketplace contract
```js
```

### 3. Create tests
TODO

### 4. Connect redstone oracles
#### Install `redstone-evm-connector`
TODO: add description
```sh
yarn add redstone-evm-connector
```

#### Update contracts code
TODO: decribe

#### Update JS code
TODO: decribe



## Harhat tasks

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
