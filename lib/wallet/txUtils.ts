import { Chain, TransactionReceipt, createPublicClient, custom } from "viem";

interface AwaitBlockchainTxReceiptParams {
  txHash: `0x${string}`;
  chain: Chain;
}

export const awaitBlockchainTxReceipt = async ({
  txHash,
  chain,
}: AwaitBlockchainTxReceiptParams): Promise<TransactionReceipt> => {
  let txReceipt = {} as TransactionReceipt;

  const publicClient = createPublicClient({
    chain: chain,
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
