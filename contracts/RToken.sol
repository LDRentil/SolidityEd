// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RToken is ERC20, Ownable(msg.sender){
    uint8 internal _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimalPlaces_
    )ERC20(name,symbol){
        _decimals = decimalPlaces_;
    }
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
    function mint(address to_, uint256 amount_) public onlyOwner {
        _mint(to_, amount_);
    }
}
