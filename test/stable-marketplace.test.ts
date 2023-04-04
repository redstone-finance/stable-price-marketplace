import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import { WrapperBuilder } from "@redstone-finance/evm-connector";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Marketplace, ExampleNFT } from "../typechain-types";

describe("Marketplace core functions test", function () {
  let marketplaceContract: Marketplace,
    exampleNFTContract: ExampleNFT,
    nftContractAddress: string,
    marketplaceAddress: string,
    wrappedMarketplaceContract: Contract,
    seller: SignerWithAddress,
    buyer: SignerWithAddress;

  const tokenId = 1;

  it("Should deploy contracts", async function () {
    // Deploy marketplace contract
    const Marketplace = await ethers.getContractFactory("StableMarketplace");
    marketplaceContract = await Marketplace.deploy();
    await marketplaceContract.deployed();
    marketplaceAddress = marketplaceContract.address;

    // Deploy NFT contract
    const ExampleNFT = await ethers.getContractFactory("ExampleNFT");
    exampleNFTContract = await ExampleNFT.deploy();
    await exampleNFTContract.deployed();
    nftContractAddress = exampleNFTContract.address;

    // Should map users
    [seller, buyer] = await ethers.getSigners();
  });

  it("Should mint NFT", async function () {
    // Mint first NFT
    const mintTx1 = await exampleNFTContract.mint();
    await mintTx1.wait();
  });

  it("Seller should post sell order for token 2 with stable USD price", async function () {
    // Approve NFT transfer
    const approveTx = await exampleNFTContract.approve(
      marketplaceContract.address,
      tokenId
    );
    await approveTx.wait();

    // Post sell order
    const usdPrice = ethers.utils.parseEther("100");
    const postOrderTx = await marketplaceContract.postSellOrder(
      nftContractAddress,
      tokenId,
      usdPrice
    );
    await postOrderTx.wait();

    // Check NFT owner (marketplace should own the NFT now)
    expect(await exampleNFTContract.ownerOf(tokenId)).to.equal(
      marketplaceAddress
    );
  });

  it("Should wrap marketplace contract with redstone wrapper", async function () {
    const contract = marketplaceContract.connect(buyer);
    wrappedMarketplaceContract = WrapperBuilder.wrap(contract).usingDataService(
      {
        dataServiceId: "redstone-main-demo",
        uniqueSignersCount: 1,
        dataFeeds: ["AVAX"],
      },
      ["https://d33trozg86ya9x.cloudfront.net"]
    );
  });

  it("Buying should fail with smaller amount then seller requested", async function () {
    const orderId = 0;

    // Get expected ether amount
    const expectedAvaxAmount = await wrappedMarketplaceContract.getPrice(
      orderId
    );
    logExpectedAmount(expectedAvaxAmount);

    // Trying to buy (should fail)
    await expect(
      wrappedMarketplaceContract.buy(orderId, {
        value: expectedAvaxAmount.mul(99).div(100),
      })
    ).to.be.reverted;
  });

  it("Buyer should buy token for USD price expressed in AVAX", async function () {
    const orderId = 0;

    // Get expected ether amount
    const expectedAvaxAmount = await wrappedMarketplaceContract.getPrice(
      orderId
    );
    logExpectedAmount(expectedAvaxAmount);

    // Send buy tx from user 2 wallet
    const buyTx = await wrappedMarketplaceContract.buy(orderId, {
      value: expectedAvaxAmount.mul(101).div(100), // a buffer for price movements
    });
    await buyTx.wait();

    // Check NFT owner
    expect(await exampleNFTContract.ownerOf(tokenId)).to.equal(buyer.address);
  });
});

function logExpectedAmount(amount: BigNumber) {
  console.log(
    `Expected AVAX amount: ${ethers.utils.formatEther(amount.toString())}`
  );
}
