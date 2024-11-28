/* eslint-disable import/no-named-as-default */
/* eslint-disable import/named */
import ETHRegistrarABI from "@/lib/abi/eth-registrar.json";
import { nameRegistrationSmartContracts } from "../../lib/name-registration/constants";

import { Address } from "viem";
import { SupportedNetwork } from "../../lib/wallet/chains";
import { SECONDS_PER_YEAR } from "@namehash/ens-utils";
import { getBlockchainTransactionError } from "../../lib/wallet/txError";
import { parseAccount } from "viem/utils";

import { EnsPublicClient } from "../types";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
}

/*
  The commitment value is used in both 'commit' and 'register'
  functions in the registrar contract. It acts as a secret
  to prevent frontrunning attacks. The commitment value must
  be the same in both function calls, which is why we store
  it in local storage.
*/

interface MakeCommitmentParams {
  name: string;
  data: string[];
  secret: string;
  reverseRecord: boolean;
  resolverAddress: Address;
  durationInYears: bigint;
  ownerControlledFuses: number;
  authenticatedAddress: Address;
  publicClient: EnsPublicClient;
}

/**
 * Generates a commitment for ENS name registration
 *
 * This function creates a commitment hash that is used in the two-step ENS registration process.
 * It helps prevent front-running attacks by keeping the details of the registration secret until
 * the actual registration takes place.
 *
 * @param {MakeCommitmentParams} params - The parameters required for making the commitment
 * @returns {Promise<Hash | TransactionErrorType>} - The generated commitment hash or an error
 */
export async function makeCommitment({
  name,
  data,
  secret,
  reverseRecord,
  resolverAddress,
  durationInYears,
  ownerControlledFuses,
  authenticatedAddress,
  publicClient,
}: MakeCommitmentParams) {
  const chain = publicClient.chain;

  if (!Object.values(SupportedNetwork).includes(chain.id)) {
    throw new Error(`Unsupported network: ${chain.id}`);
  }

  const nameRegistrationContracts =
    nameRegistrationSmartContracts[chain.id as SupportedNetwork];

  return publicClient
    .readContract({
      account: parseAccount(authenticatedAddress),
      address: nameRegistrationContracts.ETH_REGISTRAR,
      abi: ETHRegistrarABI,
      args: [
        name,
        authenticatedAddress,
        durationInYears * SECONDS_PER_YEAR.seconds,
        secret,
        resolverAddress,
        data,
        reverseRecord,
        ownerControlledFuses,
      ],
      functionName: "makeCommitment",
    })
    .then((generatedReservationNumber) => {
      return generatedReservationNumber;
    })
    .catch((error) => {
      const errorType = getBlockchainTransactionError(error);
      return errorType || error;
    });
}
