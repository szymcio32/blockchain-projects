# Example of NFT project with dynamic fields and object wrapping

The project was built as a part of a Sui overview task. 
It allows to:
- create a Hero, Equipment or Sword object
- add a Sword object to a Hero object. The Sword object can be added later to a Hero object. It's an optional argument
- add an Equipment object to a Hero object using dynamic fields
- remove an Equipment object from a Hero object using dynamic fields

Objects can be created only by a deployer of the contract.

Few unit tests were created.

## Sui wallets

- [Sui Wallet](https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil)

- [Martian](https://martianwallet.xyz/)

## Prerequisites 
- [Install Sui](https://docs.sui.io/build/install)
- [Configure sui client](https://docs.sui.io/build/devnet#configure-sui-client)
- [Create a new account or add an existing account](https://docs.sui.io/build/cli-client#create-new-account-addresses)

## How to deploy

1. Go to `onchain_game_package` directory
2. Build a Move Package
   ```
   sui move build
   ```
3. Get SUI coin object ID stored in your account
   ```
   sui client objects <account_address>
   ```
4. Publish the Move package to the Sui distributed ledger 
   ```
   sui client publish --gas <coin_objec_id> --gas-budget 30000
   ```

## How to interact

- [using Sui explorer](https://explorer.sui.io/)
- using Sui CLI
   ```
  sui client call --function <function_name> --module <module_name> --package <package_address> --args <constructor_args> --gas-budget 1000
  ```
  Example:
  ```
  game_admin_cap_object_id=0x7fe2d504d57249a7404056f099c773c9a3c29268
  player_address=0x85667967c141ffa22ac17c791ab7cd8ac56f38f1
  name=hero_name
  url_link=https://some_url.com/
  
  sui client call --function create_hero --module onchain_game --package 0x1832ee61eb9680d6a16515f4f8b2342b3b81b028 --args $game_admin_cap_object_id $player_address $name $url_link --gas-budget 1000
  ```
  First argument is the ID of the `GameAdminCap` object. Only account having this object can invoke this function.
  `GameAdminCap` object is like `OnlyOwner` modifier.

## How to run tests

   ```
   sui move test
   ```