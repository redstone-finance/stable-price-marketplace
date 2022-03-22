// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "redstone-evm-connector/lib/contracts/message-based/PriceAware.sol";

contract Marketplace {
    enum OrderStatus { ACTIVE, CANCELED, EXECUTED }

    struct SellOrder {
        address nftContractAddress;
        uint256 tokenId;
        address creator;
        uint256 price;
        OrderStatus status;
    }

    SellOrder[] public sellOrders;

    function postSellOrder(
        address nftContractAddress,
        uint256 tokenId,
        uint256 price
    ) external {

        // Check if tokenId is owned by tx sender
        IERC721 nftContract = IERC721(nftContractAddress);
        require(nftContract.ownerOf(tokenId) == msg.sender);

        // Transfer NFT token to the contract address
        // Sender needs to approve the transfer before posting sell order
        nftContract.transferFrom(msg.sender, address(this), tokenId);

        // Save order in the sellOrders mapping
        sellOrders.push(SellOrder(
            nftContractAddress,
            tokenId,
            msg.sender,
            price,
            OrderStatus.ACTIVE
        ));
    }


    function cancelOrder(uint256 orderId) external {
        // Only order creator can cancel the order
        require(sellOrders[orderId].creator == msg.sender);
        sellOrders[orderId].status = OrderStatus.CANCELED;
    }


    function buy(uint256 orderId) external payable {
        // Order must exist and be in the active state
        SellOrder storage order = sellOrders[orderId];
        require(order.status == OrderStatus.ACTIVE);

        // Check transfered ETH value
        uint256 expectedAvaxAmount = _getPriceFromOrder(order);
        require(expectedAvaxAmount <= msg.value);

        // Transfer NFT
        IERC721 nftContract = IERC721(order.nftContractAddress);
        nftContract.transferFrom(address(this), msg.sender, order.tokenId);
    }


    function _getPriceFromOrder(SellOrder memory order) internal virtual view returns(uint256) {
        return order.price;
    }


    //Getters for the UI

    function getPrice(uint256 orderId) public view returns(uint256) {
        SellOrder storage order = sellOrders[orderId];
        return _getPriceFromOrder(order);
    }


    function getAllOrders() public view returns(SellOrder[] memory) {
        return sellOrders;
    }




}
