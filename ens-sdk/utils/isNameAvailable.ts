import { getAvailable } from "@ensdomains/ensjs/public";
import { EnsPublicClient } from "../types";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
}

interface IsNameAvailableParams {
  ensName: string;
  publicClient: EnsPublicClient;
}

export const isNameAvailable = async ({
  ensName,
  publicClient,
}: IsNameAvailableParams): Promise<boolean> => {
  const result = await getAvailable(publicClient, { name: ensName });

  return result;
};
