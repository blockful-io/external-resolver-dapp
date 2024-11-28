import { EnsPublicClient } from "../types";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
}

interface GetGasPriceParams {
  publicClient: EnsPublicClient;
}

export const getGasPrice = async ({
  publicClient,
}: GetGasPriceParams): Promise<bigint> => {
  return publicClient
    .getGasPrice()
    .then((gasPrice) => {
      return gasPrice;
    })
    .catch((error) => {
      return error;
    });
};
