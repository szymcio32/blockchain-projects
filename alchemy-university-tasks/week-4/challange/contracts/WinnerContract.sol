//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WinnerContract {
    event Winner(address);

    function attempt() external {
        console.log(
            "Msg sender %s tx origin %s",
            msg.sender,
            tx.origin
        );
        require(msg.sender != tx.origin, "msg.sender is equal to tx.origin");
        emit Winner(msg.sender);
    }
}