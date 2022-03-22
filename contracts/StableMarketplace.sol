// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "redstone-evm-connector/lib/contracts/message-based/PriceAware.sol";
import "./Marketplace.sol";

contract StableMarketplace is Marketplace, PriceAware {

  function _getPriceFromOrder(SellOrder memory order) internal override view returns(uint256) {
    return order.price / getPriceFromMsg(bytes32("ETH")) * (10 ** 8);
  }


  //TODO: Explain how to get this magic address
  function isSignerAuthorized(address _signer) public override view returns (bool) {
      return _signer == 0x0C39486f770B26F5527BBBf942726537986Cd7eb;
    }
}
