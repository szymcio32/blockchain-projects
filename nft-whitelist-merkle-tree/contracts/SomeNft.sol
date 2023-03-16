// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SomeNft is ERC721, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    bytes32 public merkleRootHash;
    string public baseURI;
    mapping(address => bool) public whitelistClaimed;

    uint256 public provenanceHash;
    uint256 public randomizedStartNumber;

    struct PresaleConfig {
      uint32 startTime;
      uint32 endTime;
      uint32 supplyLimit;
      uint32 totalMinted;
      uint256 mintPrice;
    }

    PresaleConfig public presaleConfig;

    struct DutchAuctionConfig {
      uint32 startTime;
      uint32 bottomTime;
      uint32 stepInterval;
      uint256 startPrice;
      uint256 bottomPrice;
      uint256 priceStep;
    }

    DutchAuctionConfig public dutchAuctionConfig;

    uint256 public constant TOTAL_SUPPLY = 999;

    event PreSaleMint(address _address, uint256 refund);
    event PublicSaleMint(address _address, uint256 refund);
    event StartingNumberSet(uint256 _value);
    event ProvenanceHashUpdate(uint256 _hash);

    constructor(bytes32 _merkleRootHash, string memory _URI, uint32 _preSaleStartTime, uint32 _preSaleEndTime,
                uint32 _publicSaleStartTime, uint32 _publicSaleEndTime)
        ERC721("SomeNft", "SNFT")
    {
        merkleRootHash = _merkleRootHash;
        baseURI = _URI;

        presaleConfig = PresaleConfig({
          startTime: _preSaleStartTime,
          endTime: _preSaleEndTime,
          supplyLimit: 10,
          totalMinted: 0,
          mintPrice: 0.5 ether
        });

        dutchAuctionConfig = DutchAuctionConfig ({
            startTime: _publicSaleStartTime,
            bottomTime: _publicSaleEndTime,
            stepInterval: 120,
            startPrice: 1.5 ether,
            bottomPrice: 0.06 ether,
            priceStep: 0.001 ether
        });
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function safeMint(address to) private {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function preMint(bytes32[] calldata _proof) external payable nonReentrant {
        PresaleConfig storage _config = presaleConfig;

        require(
            block.timestamp >= _config.startTime && block.timestamp < _config.endTime,
            "Presale is not active"
        );

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(_proof, merkleRootHash, leaf) == true,
            "Not allowed for pre mint"
        );

        require((_config.totalMinted + 1) <= _config.supplyLimit, "Not enough tokens to mint");

        require(msg.value >= _config.mintPrice, "The amount of ETH is too small");
        require(whitelistClaimed[msg.sender] == false, "Already minted");

        refund(msg.value, _config.mintPrice);
        whitelistClaimed[msg.sender] = true;
        _config.totalMinted++;

        safeMint(msg.sender);
        emit PreSaleMint(msg.sender, msg.value - _config.mintPrice);
    }

    function publicSale() external payable nonReentrant {
        DutchAuctionConfig storage _config = dutchAuctionConfig;
        uint256 tokenId = _tokenIdCounter.current();

        require(block.timestamp >= _config.startTime, "Public sale is not active");
        require(TOTAL_SUPPLY >= tokenId, "Mint limit reached");

        // get current mint price
        uint currentPrice;
        if (block.timestamp < _config.startTime) {
          currentPrice = _config.startPrice;
        } else if (block.timestamp >= _config.bottomTime) {
          currentPrice = _config.bottomPrice;
        } else {
          uint256 elapsedIntervals = (block.timestamp - _config.startTime) / _config.stepInterval;
          currentPrice = _config.startPrice - (elapsedIntervals * _config.priceStep);
        }
        require(msg.value >= currentPrice, "The amount of ETH is too small");

        refund(msg.value, currentPrice);

        safeMint(msg.sender);
        emit PublicSaleMint(msg.sender, msg.value - currentPrice);
    }

    function refund(uint senderAmount, uint mintPrice) private {
        if (senderAmount > mintPrice) {
          Address.sendValue(payable(msg.sender), senderAmount - mintPrice);
        }
    }

    function getTotalNftMintedOnPreSale() external view returns (uint32) {
        PresaleConfig memory _config = presaleConfig;
        return _config.totalMinted;
    }

    function withdraw() external onlyOwner {
        uint amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Failed to send Ether");
    }

    function setStartNumber() external onlyOwner {
        require(provenanceHash != 0, "Provenance hash not set");
        require(randomizedStartNumber == 0, "Number already set");

        uint256 number = uint256(
          keccak256(
            abi.encodePacked(
              blockhash(block.number - 1),
              block.coinbase,
              block.difficulty,
              block.timestamp
            )
          )
        );

        randomizedStartNumber = (number % TOTAL_SUPPLY) + 1;

        emit StartingNumberSet(randomizedStartNumber);
    }

    function setProvenanceHash(uint256 _provenanceHash) external onlyOwner {
        require(randomizedStartNumber == 0, "Starting number already set");

        emit ProvenanceHashUpdate(_provenanceHash);
        provenanceHash = _provenanceHash;
    }
}