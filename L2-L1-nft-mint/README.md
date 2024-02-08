# Mint NFT on Ethereum (L1) from StarkNet (L2)

The project was built as a part of a StarkNet overview task. It allows to mint an NFT on Ethereum from StarkNet and get the final confirmation of success on StarkNet.

In general the action flow is the following:
- invoke 1 transaction on L2 (send mint request)
- invoke 1 transaction on L1 (consume mint request and send the confirmation to L2)


## StarkNet wallets

- [Argent X](https://www.argent.xyz/argent-x/)

- [Braavos](https://braavos.app/)

## Deployed contracts

**Goerli - L1**
https://goerli.etherscan.io/address/0xd6B21C200dE6a1F62d2D119BBF18Ee87BC878904

**StarkNet Testnet - L2**
https://testnet.starkscan.co/contract/0x0191d3844052e8a503e6a37851300aa3073ecda022414d729e77efa48c7884ca

## How to use

1. On the L2 contract call `create_l1_nft` function and provide your L1 wallet address
2. Wait until the transaction will be accepted on L1
3. On the L1 contract call `createNftFromL2` function and provide your L2 wallet address
4. Wait until in the "Message Logs" tab in the L2 contract the "CONSUMED_ON_L1" and "CONSUMED_ON_L2" messgaes appears. [Example](https://testnet.starkscan.co/contract/0x0191d3844052e8a503e6a37851300aa3073ecda022414d729e77efa48c7884ca#messagelogs) 
5. Check if `TokenCounter` variable was incremented on L1 contract
6. Check your NFT balance by invoking the `get_nfts_minted_from_l2_count` funcion on L2 contract

## How to deploy

1. Go to `L2` directory
   - set up the environment (I attached my `requirements.txt` file for python env)

    https://starknet.io/docs/quickstart.html
   - create an account

    https://docs.starknet.io/documentation/getting_started/account_setup/
   - set up env variables
   ```
   export STARKNET_NETWORK=alpha-goerli
   export STARKNET_WALLET=starkware.starknet.wallets.open_zeppelin.OpenZeppelinAccount
   ```

   - compile the contract
   ```
    starknet-compile contracts/NftOnL1.cairo  --output contracts/NftOnL1.json --abi contracts/NftOnL1_abi.json 
    starknet declare --contract contracts/NftOnL1.json 
    ```

    - put the class_hash from `declare` command to `deploy` command and provide as an input your L2 address. Example:
    ```
    starknet deploy --class_hash 0x2d828c719ddd718951e3190e330bbeb3f7f5c445f4caf892d153a57aeff15ac --inputs 0x066EDD12Be3d82138038d7b1043944DBe7C339DeC5D52745e3dfCF8a1c4814fb
    ```       
    - save the deployed contract address

2. Go to `L1` directory
   - run command `npm install`
   - create `.env` file and add required variables 
   - change the starknet contract address in the `scripts/deploy.ts` script 
   - deploy the contract `npx hardhat run scripts/deploy.ts --network goerli`

3. On the starknet L2 contract call the `set_l1_contract_address` function and provide address of the above deployed L1 contract
4. Contracts are ready to use. Go to [How to deploy](#how-to-deploy) section