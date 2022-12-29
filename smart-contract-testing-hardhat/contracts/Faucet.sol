// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Faucet {
    address payable public owner;
    event Withdraw(address, uint);

    constructor() payable {
        owner = payable(msg.sender);
    }

    function withdraw(uint _amount) public payable {
        require(_amount <= 0.1 ether, "Max amount is 0.1 ether");
        (bool sent, ) = payable(msg.sender).call{value: _amount}("");
        require(sent, "Failed to send Ether");
        emit Withdraw(msg.sender, _amount);
    }

    function withdrawAll() public onlyOwner {
        (bool sent, ) = owner.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }

    function destroyFaucet() public onlyOwner {
        selfdestruct(owner);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}
