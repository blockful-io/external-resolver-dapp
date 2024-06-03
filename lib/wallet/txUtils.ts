import { TransactionReceipt } from "viem";
import { publicClient } from "./wallet-config";

export const awaitBlockchainTxReceipt = async (
  txHash: `0x${string}`
): Promise<TransactionReceipt> => {
  let txReceipt = {} as TransactionReceipt;

  while (txReceipt.blockHash === undefined) {
    /*
      Since the transaction takes some time to be registered in the blockchain, 
      our code waits for this to happen in order to retrieve a valid TransactionReceipt.
    */
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    if (receipt.blockHash) {
      txReceipt = receipt;
    }
  }

  return txReceipt;
};
