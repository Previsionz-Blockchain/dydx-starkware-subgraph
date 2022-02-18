# dYdX Starkware Subgraph

## Setup

```
yarn install
yarn codegen
yarn build
```

## Test

Tests are written with the data of the BlockHash [0x46c212912be05a090a9300cf87fd9434b8e8bbca15878d070ba83375a5dbaebd (12504768)](https://etherscan.io/block/12504768). Make sure that you've uncommented the line ```export { runTests } from "./mapping.test";```in the ```mapping.ts``` file.

```
yarn build
matchstick CallProxy
```

## Deploy

The default deploy command will upload the subgraph to the [Hosted-Service](https://thegraph.com/hosted-service/subgraph/previsionz-block-data/dydx-balances).

```
yarn deploy
```
