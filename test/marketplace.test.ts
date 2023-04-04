import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ExampleNFT, Marketplace } from "../typechain-types";

describe("Marketplace core functions test", function () {
  let marketplaceContract: Marketplace,
    exampleNFTContract: ExampleNFT,
    nftContractAddress: string,
    marketplaceAddress: string,
    seller: SignerWithAddress,
    buyer: SignerWithAddress;

  const tokenId = 1;

  it("Should deploy contracts", async function () {
    // Deploy marketplace contract
    const Marketplace = await ethers.getContractFactory("Marketplace");
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

  it("Seller should post sell order for token 1 with ETH price", async function () {
    // Approve NFT transfer
    const approveTx = await exampleNFTContract.approve(
      marketplaceContract.address,
      tokenId
    );
    await approveTx.wait();

    // Post sell order
    const avaxPrice = ethers.utils.parseEther("1");
    const postOrderTx = await marketplaceContract.postSellOrder(
      nftContractAddress,
      tokenId,
      avaxPrice
    );
    await postOrderTx.wait();

    // Check NFT owner (marketplace should own the NFT now)
    expect(await exampleNFTContract.ownerOf(tokenId)).to.equal(
      marketplaceAddress
    );
  });

  it("Should get all orders", async function () {
    const allOrders = await marketplaceContract.getAllOrders();
    expect(allOrders.length).to.equal(1);
    expect(allOrders[0].tokenId).to.equal(1);
  });

  it("Buying should fail with smaller amount then seller requested", async function () {
    const orderId = 0;

    // Get expected avax amount
    const expectedAvaxAmount = await marketplaceContract.getPrice(orderId);
    logExpectedAmount(expectedAvaxAmount);

    await expect(
      marketplaceContract.connect(buyer).buy(orderId, {
        value: expectedAvaxAmount.mul(99).div(100), // We reduce the value by 1%
      })
    ).to.be.reverted;
  });

  it("Buyer should buy token 1 for AVAX price", async function () {
    const orderId = 0;

    // Get expected AVAX amount
    const expectedAvaxAmount = await marketplaceContract.getPrice(orderId);
    logExpectedAmount(expectedAvaxAmount);

    // Send buy tx from buyer's wallet
    const buyTx = await marketplaceContract.connect(buyer).buy(orderId, {
      value: expectedAvaxAmount.mul(101).div(100), // a buffer for price movements
    });
    await buyTx.wait();

    // Check NFT owner
    expect(await exampleNFTContract.ownerOf(tokenId)).to.equal(buyer.address);
  });

  it("Should post and cancel order", async function () {
    const tokenId = 1;

    // Approve NFT transfer
    const approveTx = await exampleNFTContract
      .connect(buyer)
      .approve(marketplaceContract.address, tokenId);
    await approveTx.wait();

    // Post sell order
    const avaxPrice = ethers.utils.parseEther("1");
    const postOrderTx = await marketplaceContract
      .connect(buyer)
      .postSellOrder(nftContractAddress, tokenId, avaxPrice);
    await postOrderTx.wait();

    // Cancel order
    const cancelTx = await marketplaceContract.connect(buyer).cancelOrder(1);
    await cancelTx.wait();
  });
});

function logExpectedAmount(amount: BigNumber) {
  console.log(
    `Expected AVAX amount: ${ethers.utils.formatEther(amount.toString())}`
  );
}
