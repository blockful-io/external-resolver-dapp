import { TransactionReceipt, createPublicClient, custom } from "viem";
import { isTestnet } from "./chains";
import { mainnet, sepolia } from "viem/chains";

export const awaitBlockchainTxReceipt = async (
  txHash: `0x${string}`
): Promise<TransactionReceipt> => {
  let txReceipt = {} as TransactionReceipt;

  const publicClient = createPublicClient({
    chain: isTestnet ? sepolia : mainnet,
    transport: custom(window.ethereum),
  });

  /*
      Since the transaction takes some time to be registered in the blockchain, 
      our code waits for this to happen in order to retrieve a valid TransactionReceipt.
    */
  const receipt = await publicClient.waitForTransactionReceipt({
    pollingInterval: 1_000,
    hash: txHash,
  });

  if (receipt.blockHash) {
    txReceipt = receipt;
  }

  return txReceipt;
};
