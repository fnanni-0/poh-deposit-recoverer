import { providers, Wallet } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { gasPriceToGwei } from "./utils";
import ENV from './environ.json';
require('log-timestamp');

const ETHEREUM_RPC_URL = ENV.ETHEREUM_RPC_URL || "http://127.0.0.1:8545"
const PRIVATE_KEY_EXECUTOR = ENV.PRIVATE_KEY_EXECUTOR || ""

if (PRIVATE_KEY_EXECUTOR === "") {
  console.warn("Must provide PRIVATE_KEY_EXECUTOR environment variable, corresponding to Ethereum EOA with assets to be transferred")
  process.exit(1)
}

const provider = new providers.JsonRpcProvider(ETHEREUM_RPC_URL);
const walletZeroGas = new Wallet(PRIVATE_KEY_EXECUTOR, provider);

console.log(`Zero Gas Account: ${walletZeroGas.address}`)

async function burn(wallet: Wallet) {
    const balance = await wallet.getBalance();
    if (balance.isZero()) {
        console.log(`Balance is zero.`);
        return;
    }

    const gasPrice = balance.div(21000).sub(1);
    if (gasPrice.lt(1e9)) {
        console.log(`Balance too low to burn (balance=${formatEther(balance)} gasPrice=${gasPriceToGwei(gasPrice)})`);
        return;
    }

    try {
        console.log(`Burning ${formatEther(balance)}`);
        const tx = await wallet.sendTransaction({
            to: wallet.address,
            gasLimit: 21000,
            gasPrice
        });
        console.log(`Sent tx with nonce ${tx.nonce}`);
    } catch (err) {
        console.log(`Error sending tx: ${err.message ?? err}`);
    }
}

async function main() {
    console.log(`Connected to ${ETHEREUM_RPC_URL}`);
    provider.on('block', async (blockNumber) => {
        console.log(`New block ${blockNumber}`);
        await burn(walletZeroGas);
    });
}

main()