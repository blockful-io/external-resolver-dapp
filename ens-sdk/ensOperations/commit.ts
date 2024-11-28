import ETHRegistrarABI from "@/lib/abi/eth-registrar.json";
import {
  DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES,
  nameRegistrationSmartContracts,
} from "../../lib/name-registration/constants";

import {
  publicActions,
  createWalletClient,
  custom,
  Address,
  Chain,
} from "viem";
import { SupportedNetwork } from "../../lib/wallet/chains";
import { ENSName } from "@namehash/ens-utils";
import {
  TransactionErrorType,
  getBlockchainTransactionError,
} from "../../lib/wallet/txError";
import { getNameRegistrationSecret } from "@/lib/name-registration/localStorage";
import { parseAccount } from "viem/utils";

import { EnsPublicClient } from "../types";
import { makeCommitment } from "./makeCommitment";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
}

/*
  1st step of a name registration
*/

interface CommitParams {
  ensName: ENSName;
  durationInYears: bigint;
  resolverAddress: Address;
  authenticatedAddress: Address;
  registerAndSetAsPrimaryName: boolean;
  publicClient: EnsPublicClient;
  chain: Chain;
}

/**
 * Commits to registering an ENS name
 *
 * This is the first step in the two-step ENS registration process. It creates and submits
 * a commitment to the blockchain, which must be followed by the actual registration after
 * a waiting period.
 *
 * @param {CommitParams} params - The parameters for the commit operation
 * @returns {Promise<`0x${string}` | TransactionErrorType>} - The transaction hash or an error
 */
export const commit = async ({
  ensName,
  durationInYears,
  resolverAddress,
  authenticatedAddress,
  registerAndSetAsPrimaryName,
  publicClient,
  chain,
}: CommitParams): Promise<`0x${string}` | TransactionErrorType> => {
  try {
    const walletClient = createWalletClient({
      account: authenticatedAddress,
      chain: chain,
      transport: custom(window.ethereum),
    });

    const client = walletClient.extend(publicActions);

    if (!client) throw new Error("WalletClient not found");

    const nameWithoutTLD = ensName.name.replace(".eth", "");

    const commitmentWithConfigHash = await makeCommitment({
      name: nameWithoutTLD,
      data: [],
      authenticatedAddress,
      durationInYears: durationInYears,
      secret: getNameRegistrationSecret(),
      reverseRecord: registerAndSetAsPrimaryName,
      resolverAddress: resolverAddress,
      ownerControlledFuses: DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES,
      publicClient: publicClient,
    });

    if (!Object.values(SupportedNetwork).includes(chain.id)) {
      throw new Error(`Unsupported network: ${chain.id}`);
    }

    const nameRegistrationContracts =
      nameRegistrationSmartContracts[chain.id as SupportedNetwork];

    const { request } = await client.simulateContract({
      account: parseAccount(authenticatedAddress),
      address: nameRegistrationContracts.ETH_REGISTRAR,
      args: [commitmentWithConfigHash],
      functionName: "commit",
      abi: ETHRegistrarABI,
      gas: 70000n,
    });

    const txHash = await client.writeContract(request);

    return txHash;
  } catch (error) {
    console.error(error);
    const errorType = getBlockchainTransactionError(error);
    return errorType;
  }
};
