import { MerkleTree } from 'merkletreejs';
import { utils } from 'ethers';

const WHITELIST_ADDRESSES = [
    '0x16292EFf852b5B12859aC6697A14A73E9cEa70C2',
    '0xe19105463D6FE2f2BD86c69Ad478F4B76Ce49c53',
    '0x1eD656e78B19b3340CC30e7b00Ee7011E1CB1820',
    '0xBFCd86e36D947A9103A7D4a95d178A432723d6aD',
    '0xEf8801eaf234ff82801821FFe2d78D60a0237F97',
]

const leafNodes = WHITELIST_ADDRESSES.map(addr => utils.keccak256(addr));
const merkleTree = new MerkleTree(leafNodes, utils.keccak256, { sortPairs: true });

console.log(merkleTree.toString());

const rootHash = merkleTree.getRoot().toString('hex');
console.log('Root hash: ', rootHash);