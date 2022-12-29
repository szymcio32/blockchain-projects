Simple subgraph for Uniswap V2 contract: 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f

## Deploy to the hosted service:

1. `node install`
2. In the `package.json` modify the `deploy` script.

- Add your username and subgraph name
- Add access token

3. Deploy the subgraph:

- `node run codegen`
- `node run build`
- `node run deploy`
