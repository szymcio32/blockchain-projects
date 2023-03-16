# NFT contract using Merkle Tree for whitelist check

This project demonstrates a NFT contract that uses Merkle Tree 
for checking if an address is allowed for a premint. The proof is generated
offchain and the root hash of the merkle tree is provided to the smart contract.

### Abilities of contract:
- premint for whitelisted addresses using Merkle Tree method
- public sale using Dutch Auction approach
- provenance hash solution
- withdraw funds

### Others
- tests included
- script that generates a merkle root hash offchain for allowed addresses