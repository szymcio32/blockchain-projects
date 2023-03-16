import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

describe("SomeNft", function () {
  async function getMerkleTreeFixture() {
    const [owner, validAccount] = await ethers.getSigners();
    const WHITELIST_ADDRESSES = [
        validAccount.address,
        '0xe19105463D6FE2f2BD86c69Ad478F4B76Ce49c53',
        '0x1eD656e78B19b3340CC30e7b00Ee7011E1CB1820',
        '0xBFCd86e36D947A9103A7D4a95d178A432723d6aD',
        '0xEf8801eaf234ff82801821FFe2d78D60a0237F97',
    ]

    const leafNodes = WHITELIST_ADDRESSES.map(addr => keccak256(addr));
    const merkleTree = new MerkleTree(leafNodes, keccak256, {
        sortPairs: true,
        //hashLeaves: true
    });

    const merkleRootHash = merkleTree.getHexRoot();
    const wallet = ethers.Wallet.createRandom()
    const invalidProof = merkleTree.getHexProof(keccak256(wallet.address))
    const validProof = merkleTree.getHexProof(keccak256(validAccount.address))

    return { merkleRootHash, merkleTree, invalidProof, validProof, validAccount, owner };
  }

  async function deploySomeNftFixture() {
    const { merkleRootHash } = await loadFixture(getMerkleTreeFixture);
    const BASE_URI = 'some uri';

    let saleEndDate = new Date();
    saleEndDate.setDate(saleEndDate.getDate() + 1);
    saleEndDate = Math.floor(saleEndDate.getTime() / 1000);
    let saleStartDate = new Date();
    saleStartDate.setDate(saleStartDate.getDate() - 1);
    saleStartDate = Math.floor(saleStartDate.getTime() / 1000);

    const SomeNft = await ethers.getContractFactory("SomeNft");
    const someNFT = await SomeNft.deploy(merkleRootHash, BASE_URI, saleStartDate, saleEndDate,
    saleStartDate, saleEndDate);

    return { someNFT, BASE_URI, saleStartDate, saleEndDate };
  }

  describe("Deployment", function () {
    it("Should set the right merkle root hash", async function () {
      const { merkleRootHash } = await loadFixture(getMerkleTreeFixture);
      const { someNFT } = await loadFixture(deploySomeNftFixture);

      expect(await someNFT.merkleRootHash()).to.equal(merkleRootHash);
    });
  });

  describe("Presale", function () {
    it("Should revert when the presale finished", async function () {
      const { merkleRootHash, merkleTree, invalidProof } = await loadFixture(getMerkleTreeFixture);
      const { saleStartDate, saleEndDate } = await loadFixture(deploySomeNftFixture);
      const SomeNft = await ethers.getContractFactory("SomeNft");
      const someNFT = await SomeNft.deploy(merkleRootHash, 'uri', 1672668962, 1672755362, saleStartDate, saleEndDate);

      await expect(someNFT.preMint(invalidProof)).to.be.revertedWith(
          "Presale is not active"
      );
    });
    it("Should revert when the presale not started", async function () {
      const { merkleRootHash, merkleTree, invalidProof } = await loadFixture(getMerkleTreeFixture);
      const { saleStartDate, saleEndDate } = await loadFixture(deploySomeNftFixture);
      const SomeNft = await ethers.getContractFactory("SomeNft");
      const someNFT = await SomeNft.deploy(merkleRootHash, 'uri', 2529261258, 2531680458, saleStartDate, saleEndDate);

      await expect(someNFT.preMint(invalidProof)).to.be.revertedWith(
          "Presale is not active"
      );
    });
    it("Should revert when the proof is invalid", async function () {
      const { invalidProof } = await loadFixture(getMerkleTreeFixture);
      const { someNFT } = await loadFixture(deploySomeNftFixture);

      await expect(someNFT.preMint(invalidProof)).to.be.revertedWith(
          "Not allowed for pre mint"
      );
    });
    it("Should revert when ETH amount is too small", async function () {
      const { validProof, validAccount } = await loadFixture(getMerkleTreeFixture);
      const { someNFT } = await loadFixture(deploySomeNftFixture);
      const amount = ethers.utils.parseUnits("0.3", "ether");

      const connectedSomeNFT = await someNFT.connect(validAccount);
      await expect(connectedSomeNFT.preMint(validProof, {value: amount})).to.be.revertedWith(
          "The amount of ETH is too small"
      );
    });
    it("Should revert when user wants to mint twice", async function () {
      const { validProof, validAccount } = await loadFixture(getMerkleTreeFixture);
      const { someNFT } = await loadFixture(deploySomeNftFixture);
      const amount = ethers.utils.parseUnits("0.6", "ether");

      const connectedSomeNFT = await someNFT.connect(validAccount);
      await connectedSomeNFT.preMint(validProof, {value: amount});
      expect(await someNFT.whitelistClaimed(validAccount.address)).to.equal(true);

      await expect(connectedSomeNFT.preMint(validProof, {value: amount})).to.be.revertedWith(
          "Already minted"
      );
    });
    it("Should mint", async function () {
      const { validProof, validAccount } = await loadFixture(getMerkleTreeFixture);
      const { someNFT } = await loadFixture(deploySomeNftFixture);
      const amount = ethers.utils.parseUnits("0.6", "ether");

      expect(await someNFT.getTotalNftMintedOnPreSale()).to.equal(0);

      const connectedSomeNFT = await someNFT.connect(validAccount);
      await expect(connectedSomeNFT.preMint(validProof, {value: amount}))
          .to.emit(connectedSomeNFT, "PreSaleMint")
          .withArgs(validAccount.address, ethers.utils.parseUnits('0.1', 'ether'));

      expect(await someNFT.whitelistClaimed(validAccount.address)).to.equal(true);
      const expectedAmount = ethers.utils.parseUnits('0.5', 'ether');
      expect(await ethers.provider.getBalance(someNFT.address)).to.equal(expectedAmount);
      expect(await someNFT.getTotalNftMintedOnPreSale()).to.equal(1);
    });
  });

  describe("Public sale", function () {
    it("Should revert when the public sale not started", async function () {
      const { merkleRootHash } = await loadFixture(getMerkleTreeFixture);
      const SomeNft = await ethers.getContractFactory("SomeNft");
      const someNFT = await SomeNft.deploy(merkleRootHash, 'uri', 2529261258, 2531680458, 2529261258, 2531680458);

      await expect(someNFT.publicSale()).to.be.revertedWith(
          "Public sale is not active"
      );
    });
    it("Should revert when ETH amount is too small", async function () {
      const { merkleRootHash, validAccount } = await loadFixture(getMerkleTreeFixture);
      const { saleStartDate, saleEndDate } = await loadFixture(deploySomeNftFixture);
      const SomeNft = await ethers.getContractFactory("SomeNft");
      const someNFT = await SomeNft.deploy(merkleRootHash, 'uri', 2529261258, 2531680458, saleStartDate, saleEndDate);

      const amount = ethers.utils.parseUnits("0.3", "ether");

      const connectedSomeNFT = await someNFT.connect(validAccount);
      await expect(connectedSomeNFT.publicSale({value: amount})).to.be.revertedWith(
          "The amount of ETH is too small"
      );
    });
    it("Should mint", async function () {
      const { validAccount } = await loadFixture(getMerkleTreeFixture);
      const { someNFT } = await loadFixture(deploySomeNftFixture);
      const amount = ethers.utils.parseUnits("1.5", "ether");

      const connectedSomeNFT = await someNFT.connect(validAccount);
      await expect(connectedSomeNFT.publicSale({value: amount}))
          .to.emit(connectedSomeNFT, "PublicSaleMint");

      const bottomAmount = ethers.utils.parseUnits('0.780', 'ether');
      const upperAmount = ethers.utils.parseUnits('0.782', 'ether');
      expect(await ethers.provider.getBalance(someNFT.address)).to.be.within(
        bottomAmount,
        upperAmount
      );
    });
  });

  describe("Withdraw", function () {
    it("Only owner can withdraw", async function () {
      const { validProof, validAccount, owner } = await loadFixture(getMerkleTreeFixture);
      const { someNFT } = await loadFixture(deploySomeNftFixture);
      const amount = ethers.utils.parseUnits("0.6", "ether");

      const connectedSomeNFT = await someNFT.connect(validAccount);
      await connectedSomeNFT.preMint(validProof, {value: amount});

      const expectedAmount = ethers.utils.parseUnits('0.5', 'ether');
      expect(await ethers.provider.getBalance(someNFT.address)).to.equal(expectedAmount);

      await expect(connectedSomeNFT.withdraw()).to.be.revertedWith(
          'Ownable: caller is not the owner'
      );
      await expect(someNFT.withdraw()).to.changeEtherBalances(
          [owner, someNFT],
          [expectedAmount, ethers.utils.parseUnits('-0.5', 'ether')]
      );
    });
  });

  describe("setStartNumber", function () {
    it("Should revert when provenance hash not set", async function () {
      const { someNFT } = await loadFixture(deploySomeNftFixture);

      await expect(someNFT.setStartNumber()).to.be.revertedWith(
          'Provenance hash not set'
      );
    });
    it("Should revert when the start number is already set", async function () {
      const { someNFT } = await loadFixture(deploySomeNftFixture);

      await someNFT.setProvenanceHash(22);
      await someNFT.setStartNumber();

      await expect(someNFT.setStartNumber()).to.be.revertedWith(
          'Number already set'
      );
    });
    it("Only owner can set the start number", async function () {
      const { validAccount } = await loadFixture(getMerkleTreeFixture);
      const { someNFT } = await loadFixture(deploySomeNftFixture);

      await someNFT.setProvenanceHash(222);

      const connectedSomeNFT = await someNFT.connect(validAccount);
      await expect(connectedSomeNFT.setStartNumber()).to.be.revertedWith(
          'Ownable: caller is not the owner'
      );

      await someNFT.setStartNumber();
      expect(await someNFT.randomizedStartNumber()).to.be.above(0);
    });
  });

  describe("setProvenanceHash", function () {
    it("Only owner can set provenance hash", async function () {
      const { validAccount } = await loadFixture(getMerkleTreeFixture);
      const { someNFT } = await loadFixture(deploySomeNftFixture);

      const connectedSomeNFT = await someNFT.connect(validAccount);
      await expect(connectedSomeNFT.setProvenanceHash(222)).to.be.revertedWith(
          'Ownable: caller is not the owner'
      );

      await expect(someNFT.setProvenanceHash(222))
      .to.emit(someNFT, "ProvenanceHashUpdate")
      .withArgs(222);
      expect(await someNFT.provenanceHash()).to.equal(222);
    });
    it("Should revert when starting number already set", async function () {
      const { someNFT } = await loadFixture(deploySomeNftFixture);

      await someNFT.setProvenanceHash(222);
      await someNFT.setStartNumber();

      await expect(someNFT.setProvenanceHash(555)).to.be.revertedWith(
          'Starting number already set'
      );
    });
  });
});
