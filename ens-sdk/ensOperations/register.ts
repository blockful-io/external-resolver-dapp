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
import { SECONDS_PER_YEAR, ENSName } from "@namehash/ens-utils";
import {
  TransactionErrorType,
  getBlockchainTransactionError,
} from "../../lib/wallet/txError";
import { getNameRegistrationSecret } from "@/lib/name-registration/localStorage";

import { DomainData, MessageData } from "../../lib/utils/types";

import { getNamePrice, getChain } from "../utils";
import { getRevertErrorData } from "../utils/getRevertErrorData";
import { EnsPublicClient } from "../types";
import { storeDataInDb } from "./storeDataInDb";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
}

/*
  2nd step of a name registration
*/

interface RegisterParams {
  ensName: ENSName;
  resolverAddress: Address;
  durationInYears: bigint;
  authenticatedAddress: Address;
  registerAndSetAsPrimaryName: boolean;
  publicClient: EnsPublicClient;
  chain: Chain;
}

/**
 * Registers an ENS name
 *
 * This is the second step in the two-step ENS registration process. It finalizes the registration
 * of the ENS name after the commitment has been made and the waiting period has passed.
 *
 * @param {RegisterParams} params - The parameters for the registration
 * @returns {Promise<`0x${string}` | TransactionErrorType>} - The transaction hash or an error
 */
export const register = async ({
  ensName,
  resolverAddress,
  durationInYears,
  authenticatedAddress,
  registerAndSetAsPrimaryName,
  publicClient,
  chain,
}: RegisterParams): Promise<`0x${string}` | TransactionErrorType> => {
  try {
    const walletClient = createWalletClient({
      account: authenticatedAddress,
      chain: chain,
      transport: custom(window.ethereum),
    });

    const client = walletClient.extend(publicActions);

    if (!client) throw new Error("WalletClient not found");

    const nameWithoutTLD = ensName.name.replace(".eth", "");

    const namePrice = await getNamePrice({
      ensName,
      durationInYears,
      publicClient,
    });

    if (!Object.values(SupportedNetwork).includes(chain.id)) {
      throw new Error(`Unsupported network: ${chain.id}`);
    }

    const nameRegistrationContracts =
      nameRegistrationSmartContracts[chain.id as SupportedNetwork];

    const txHash = await client.writeContract({
      address: nameRegistrationContracts.ETH_REGISTRAR,
      chain: chain,
      account: authenticatedAddress,
      args: [
        nameWithoutTLD,
        authenticatedAddress,
        durationInYears * SECONDS_PER_YEAR.seconds,
        getNameRegistrationSecret(),
        resolverAddress,
        [],
        registerAndSetAsPrimaryName,
        DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES,
      ],
      value: namePrice,
      abi: ETHRegistrarABI,
      functionName: "register",
      gas: 500000n,
    });

    return txHash;
  } catch (error: unknown) {
    const data = getRevertErrorData(error);

    if (data?.errorName === "StorageHandledByOffChainDatabase") {
      const [domain, url, message] = data.args as [
        DomainData,
        string,
        MessageData,
      ];

      const signedData = await storeDataInDb({
        domain,
        url,
        message,
        authenticatedAddress,
        chain: chain,
      });

      if (typeof signedData === "string") {
        return signedData as `0x${string}`;
      } else {
        throw new Error("Error handling off-chain storage");
      }
    } else {
      console.error(error);
      const errorType = getBlockchainTransactionError(error);
      return errorType;
    }
  }
};
