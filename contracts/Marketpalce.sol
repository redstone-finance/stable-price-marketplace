// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Marketplace {
  enum Currency { ETH, USD }
  enum OrderStatus { ACTIVE, CANCELED, EXECUTED }

  struct SellOrder {
    address nftContractAddress;
    uint256 tokenId;
    address creator;
    uint256 price;
    Currency currency;
    OrderStatus status;
  }

  mapping(uint256 => SellOrder) public sellOrders;

  constructor() {}

  function postSellOrder(
    uint256 orderId,
    address nftContractAddress,
    uint256 tokenId,
    uint256 ethPrice
  ) external {
    _postSellOrder(
      orderId,
      nftContractAddress,
      tokenId,
      ethPrice,
      Currency.ETH
    );
  }

  function postSellOrderWithStableUsdPrice(
    uint256 orderId,
    address nftContractAddress,
    uint256 tokenId,
    uint256 usdPrice
  ) external {
    _postSellOrder(
      orderId,
      nftContractAddress,
      tokenId,
      usdPrice,
      Currency.USD
    );
  }

  function _postSellOrder(
    uint256 orderId, // users can simply randomise this number
    address nftContractAddress,
    uint256 tokenId,
    uint256 price,
    Currency currency
  ) private {
    IERC721 nftContract = IERC721(nftContractAddress);

    // Check if orderId was not already used
    require(sellOrders[orderId].creator == address(0x0));

    // Check if tokenId is owned by tx sender
    require(nftContract.ownerOf(tokenId) == msg.sender);

    // Transfer NFT token to the contract address
    // Sender needs to approve the transfer before posting sell order
    nftContract.transferFrom(msg.sender, address(this), tokenId);

    // Save order in the sellOrders mapping
    sellOrders[orderId] = SellOrder(
      nftContractAddress,
      tokenId,
      msg.sender,
      price,
      currency,
      OrderStatus.ACTIVE
    );
  }

  function cancelOrder(uint256 orderId) external {
    // Only order creator can cancel the order
    require(sellOrders[orderId].creator == msg.sender);
    sellOrders[orderId].status = OrderStatus.CANCELED;
  }

  function buy(uint256 orderId) external payable {
    // Order must exist
    SellOrder storage order = sellOrders[orderId];
    require(order.creator != address(0x0));

    // Check transfered ETH value
    uint256 expectedEthAmount = getExpectedEthAmount(order);
    require(expectedEthAmount <= msg.value);

    // Transfer token
    IERC721 nftContract = IERC721(order.nftContractAddress);
    nftContract.transferFrom(address(this), msg.sender, order.tokenId);
  }

  function getExpectedEthAmount(SellOrder storage order) private view returns(uint256) {
    if (order.currency == Currency.ETH) {
      return order.price;
    } else {
      return order.price * 3000; // TODO: connect redstone
    }
  }

  // TODO: add for web app
  // getListedNftsCount()
  // getListedNftInfo(index)
}
