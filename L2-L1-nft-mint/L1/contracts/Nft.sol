// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./IStarknetCore.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Nft is ERC721, Ownable {
    uint256 public tokenCounter = 0;
    IStarknetCore starknetCore;
    uint256 public l2FunctionSelector;
    uint256 public l2ContractAddress;

    constructor(
        string memory _name,
        string memory _symbol,
        address _starknetCore,
        uint256 _l2FunctionSelector,
        uint256 _l2ContractAddress
    ) public ERC721(_name, _symbol) {
        starknetCore = IStarknetCore(_starknetCore);
        l2FunctionSelector = _l2FunctionSelector;
        l2ContractAddress = _l2ContractAddress;
    }

    function setL2FunctionSelector(uint256 _l2FunctionSelector) external onlyOwner {
        l2FunctionSelector = _l2FunctionSelector;
    }

    function setL2ContractAddress(uint256 _l2ContractAddress) external onlyOwner {
        l2ContractAddress = _l2ContractAddress;
    }

    function createNftFromL2(uint256 l2_user) public {
        uint256[] memory payload = new uint256[](1);
        payload[0] = uint256(uint160(msg.sender));
        // Consume the message from the StarkNet core contract.
        // This will revert the (Ethereum) transaction if the message does not exist.
        starknetCore.consumeMessageFromL2(l2ContractAddress, payload);

        tokenCounter += 1;
        _safeMint(msg.sender, tokenCounter);

        uint256[] memory sender_payload = new uint256[](2);
        sender_payload[0] = l2_user;
        sender_payload[1] = uint256(uint160(msg.sender));
        // Send the message to the StarkNet core contract.
        starknetCore.sendMessageToL2(
            l2ContractAddress,
            l2FunctionSelector,
            sender_payload
        );
    }
}