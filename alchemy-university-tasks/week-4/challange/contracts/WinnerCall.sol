// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


interface IWinner {
    function attempt() external;
}


contract WinnerCall {
    address public winnerContract;

    constructor(address _winnerContract) {
        winnerContract = _winnerContract;
    }

    function callWinnerContract() public {
        IWinner(winnerContract).attempt();
    }

}
