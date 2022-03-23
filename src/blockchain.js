import { WrapperBuilder } from "redstone-evm-connector";
import { ethers } from "ethers";
import fujiAddresses from "../config/fuji-addresses.json";
import hardhatAddresses from "../config/hardhat-addresses.json";

// TODO: check connected network
async function getContractAddress(contractName) {
  const networkId = 1;
  return networkId == 1
    ? hardhatAddresses[contractName]
    : fujiAddresses[contractName];
}

// TODO: implement
async function getContractInstance(contractName) {

}

// TODO: implement
async function getOwnedNfts(address) {
  const nft = await getContractInstance("nft");
  return [1];
}

async function mintNft() {
  const newTokenId = Date.now() + Math.round(Math.random() * 1_000_000);
  const nft = await getContractInstance("nft");
  return await nft.mint(newTokenId);
}

async function getAllOrders() {
  const marketplace = await getContractInstance("marketplace");
  return await marketplace.getAllOrders();
}

async function postOrder({ tokenId, usdPrice }) {
  const marketplace = await getContractInstance("marketplace");
  const nftContract = await getContractInstance("nft");

  // Sending approve tx
  const approveTx = await nftContract.approve(marketplace.address, tokenId);
  await approveTx.wait();

  // Posting order tx
  return await marketplace.postSellOrder(
    nftContract.address,
    tokenId,
    numberToBigBlockchainNumberString(usdPrice)
  );
}

async function buy(orderId) {
  const marketplace = await getContractInstance("marketplace");

  // Wrapping marketplace contract instance.
  // It enables fetching data from redstone data pool
  // for each contract function call
  const wrappedMarketplaceContract = WrapperBuilder
    .wrapLite(marketplace)
    .usingPriceFeed("redstone", { asset: "AVAX" });

  // Checking expected amount
  const expectedAvaxAmount = await wrappedMarketplaceContract.getPrice(orderId);

  // Sending buy tx
  const buyTx = await wrappedMarketplaceContract.buy(orderId, {
    value: expectedAvaxAmount.mul(101).div(100) // a buffer for price movements
  });
  await buyTx.wait();

  return buyTx;
}

function numberToBigBlockchainNumberString(value) {
  return ethers.utils.parseEther(String(value));
}

export default {
  getOwnedNfts,
  getOwnedNfts,
  mintNft,
  getAllOrders,
  postOrder,
  buy,
};
