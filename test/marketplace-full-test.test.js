const { expect } = require("chai");
const { ethers } = require("hardhat");

// TODO: add implementation for full coverage tests
describe("Marketplace full test", function () {
  let marketplaceContract, exampleNFTContract;

  it("Should deploy contracts", async function () {
    // Deploy marketplace contract
    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplaceContract = await Marketplace.deploy();
    await marketplaceContract.deployed();

    // Deploy NFT contract
    const ExampleNFT = await ethers.getContractFactory("ExampleNFT");
    exampleNFTContract = await ExampleNFT.deploy();
    await exampleNFTContract.deployed();
  });

  // it("Should mint NFT", async function () {
  //   // TODO
  // });

  // it("Should post sell order", async function () {
  //   // TODO
  // });
});
