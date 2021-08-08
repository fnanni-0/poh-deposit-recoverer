poh-deposit-recoverer
=======================
This repository contains a simple Flashbots "searcher" for submitting a transaction from an `executor` account, but paying for the transaction from a `sponsor` account. This is accomplished by submitting a Flashbots transaction bundle, with the first "sponsor" transaction paying the "executor" wallet in ETH, followed by a series of `executor` transactions that spend this newly received ETH on gas fees.

For more information, see the [Flashbots Searcher Quick Start](https://docs.flashbots.net/flashbots-auction/searchers/quick-start/)

Use case
========
The use case for this multi-transaction setup is to recover the submission deposit made by a compromised account to the Proof of Humanity registry (see https://app.proofofhumanity.id).

Using this searcher, you can create a bundle of transaction that execute against the compromised account, spending ETH that was received in the same block.

With the activation of EIP-1559, the old method of using `gasPrice = 0` is no longer functional. Transactions must pay at least `baseFee`.


Environment Variables
=====================
- ETHEREUM_RPC_URL - Ethereum RPC endpoint. Can not be the same as FLASHBOTS_RPC_URL
- PRIVATE_KEY_EXECUTOR - Private key for the compromised Ethereum EOA that has the submission deposit locked in the Proof of Humanity contract.
- PRIVATE_KEY_SPONSOR - Private key for an account that has ETH that will be used to fund the compromised Ethereum EOA (executor) for the transactions.
- FLASHBOTS_RELAY_SIGNING_KEY - Private key used to sign messages to Flashbots to establish reputation of profitability. This can be a virgin (non-funded) account.

Setting Miner Reward
====================
Inside `src/index.ts` is :
```
const PRIORITY_GAS_PRICE = GWEI.mul(31)
```

This is the priority fee, on top of baseFee, sent to the miner for *all* transactions in the bundle, including the sponsor-funding transaction. All transactions use the same gasPrice, with no coinbase transfers in any transaction. In the case of a block re-organization, hopefully all transactions will appear in the next block as well, preventing sweeper bots from gaining access to the incoming ETH before it is spent on gas fees.


Usage
======================
Fill the environment variables in src/environ.json

```
$ npm install
$ npm run burn (in a different terminal)
$ npm run start
```
