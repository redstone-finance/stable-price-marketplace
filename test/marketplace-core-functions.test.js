const { expect } = require("chai");
const { ethers } = require("hardhat");
const { WrapperBuilder } = require("redstone-evm-connector");

describe("Marketplace core functions test", function () {
  let marketplaceContract,
    exampleNFTContract,
    nftContractAddress,
    marketplaceAddress,
    wrappedMarketplaceContract;

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
  });

  it("Should mint 2 NFTs", async function () {
    // Mint first NFT
    const mintTx1 = await exampleNFTContract.mint(1);
    await mintTx1.wait();

    // Mint second NFT
    const mintTx2 = await exampleNFTContract.mint(2);
    await mintTx2.wait();
  });

  it("User 1 should post sell order for token 1 with ETH price", async function () {
    const tokenId = 1;

    // Approve NFT transfer
    const approveTx = await exampleNFTContract.approve(marketplaceContract.address, tokenId);
    await approveTx.wait();

    // Post sell order
    const orderId = 1;
    const ethPrice = ethers.utils.parseEther("1");
    const postOrderTx = await marketplaceContract.postSellOrder(
      orderId,
      nftContractAddress,
      tokenId,
      ethPrice
    );
    await postOrderTx.wait();

    // Check NFT owner (marketplace should own the NFT now)
    expect(await exampleNFTContract.ownerOf(tokenId)).to.equal(marketplaceAddress);
  });

  it("Buying should fail with smaller amount then seller requested", async function () {
    const [_user1, user2] = await ethers.getSigners();
    const orderId = 1;

    // Get expected ether amount
    const expectedEthAmount = await marketplaceContract.getExpectedEthAmount(orderId);
    logExpectedAmount(expectedEthAmount);

    await expect(marketplaceContract.connect(user2).buy(orderId, {
      value: expectedEthAmount.mul(99).div(100), // We reduce the value by 1%
    })).to.be.reverted;
  });

  it("User 2 should buy token 1 for ETH price", async function () {
    const [_user1, user2] = await ethers.getSigners();
    const orderId = 1;

    // Get expected ETH amount
    const expectedEthAmount = await marketplaceContract.getExpectedEthAmount(orderId);
    logExpectedAmount(expectedEthAmount);

    // Send buy tx from user 2 wallet
    const buyTx = await marketplaceContract.connect(user2).buy(orderId, {
      value: expectedEthAmount,
    });
    await buyTx.wait();

    // Check NFT owner
    expect(await exampleNFTContract.ownerOf(1)).to.equal(user2.address);
  });

  it("User 1 should post sell order for token 2 with stable USD price", async function () {
    const tokenId = 2;

    // Approve NFT transfer
    const approveTx = await exampleNFTContract.approve(marketplaceContract.address, tokenId);
    await approveTx.wait();

    // Post sell order
    const orderId = 2;
    const usdPrice = ethers.utils.parseEther("300");
    const postOrderTx = await marketplaceContract.postSellOrderWithStableUsdPrice(
      orderId,
      nftContractAddress,
      tokenId,
      usdPrice
    );
    await postOrderTx.wait();

    // Check NFT owner (marketplace should own the NFT now)
    expect(await exampleNFTContract.ownerOf(tokenId)).to.equal(marketplaceAddress);
  });

  it("Should wrap marketplace contract with redstone wrapper", async function () {
    const [_user1, user2] = await ethers.getSigners();
    wrappedMarketplaceContract = WrapperBuilder
      .wrapLite(marketplaceContract.connect(user2))
      .usingPriceFeed("redstone", { asset: "ETH" });
  });

  it("Buying should fail with smaller amount then seller requested", async function () {
    const orderId = 2;

    // Get expected ether amount
    const expectedEthAmount = await wrappedMarketplaceContract.getExpectedEthAmount(orderId);
    logExpectedAmount(expectedEthAmount);

    // Trying to buy (should fail)
    await expect(wrappedMarketplaceContract.buy(orderId, {
      value: expectedEthAmount.mul(7).div(10), // We multiply the value by 0.7
    })).to.be.reverted;
  });

  it("User 2 Should buy token 2 for USD price", async function () {
    const [_user1, user2] = await ethers.getSigners();
    const orderId = 2;

    // Get expected ether amount
    const expectedEthAmount = await wrappedMarketplaceContract.getExpectedEthAmount(orderId);
    logExpectedAmount(expectedEthAmount);

    // Send buy tx from user 2 wallet
    const buyTx = await wrappedMarketplaceContract.buy(orderId, {
      value: expectedEthAmount.mul(105).div(100), // We add 5% for potential price slippage
    });
    await buyTx.wait();

    // Check NFT owner
    expect(await exampleNFTContract.ownerOf(2)).to.equal(user2.address);
  });
});

function logExpectedAmount(amount) {
  console.log(`Expected eth amount: ${ethers.utils.formatEther(amount.toString())}`);
}
