// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SomeCoolToken is ERC20 {
    uint256 constant INITIAL_SUPPLY = 100 * (10**18);

    constructor() ERC20("SomeCoolToken", "SCT") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}