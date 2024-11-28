import ENSReverseRegistrarABI from "@/lib/abi/ens-reverse-registrar.json";
import { nameRegistrationSmartContracts } from "../../lib/name-registration/constants";
import { publicActions, createWalletClient, custom, Chain } from "viem";
import { SupportedNetwork } from "../../lib/wallet/chains";
import { ENSName } from "@namehash/ens-utils";
import { getBlockchainTransactionError } from "../../lib/wallet/txError";

import { normalize } from "viem/ens";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
}

/*
  4th step of a name registration - set domain as primary name if user wants
*/

interface SetDomainAsPrimaryNameParams {
  authenticatedAddress: `0x${string}`;
  ensName: ENSName;
  chain: Chain;
}

/**
 * Sets an ENS domain as the primary name for an Ethereum address
 *
 * This function allows a user to set their newly registered or existing ENS domain
 * as the primary name associated with their Ethereum address. This is typically done
 * after registering a new ENS name or when changing the primary name.
 *
 * @param {SetDomainAsPrimaryNameParams} params - The parameters for setting the primary name
 * @returns {Promise<number | TransactionErrorType>} - A status code or an error
 */
export const setDomainAsPrimaryName = async ({
  authenticatedAddress,
  ensName,
  chain,
}: SetDomainAsPrimaryNameParams) => {
  try {
    if (!Object.values(SupportedNetwork).includes(chain.id)) {
      throw new Error(`Unsupported network: ${chain.id}`);
    }

    // Create a wallet client for sending transactions to the blockchain
    const walletClient = createWalletClient({
      chain: chain,
      transport: custom(window.ethereum),
      account: authenticatedAddress,
    });

    const client = walletClient.extend(publicActions);

    if (!client) throw new Error("WalletClient not found");

    const nameWithTLD = ensName.name.includes(".eth")
      ? ensName.name
      : `${ensName.name}.eth`;

    const network = chain.id as SupportedNetwork;

    const publicAddress = normalize(nameWithTLD);

    // Simulate the setName contract interaction
    const { request } = await client.simulateContract({
      address: nameRegistrationSmartContracts[network].ENS_REVERSE_REGISTRAR,
      account: authenticatedAddress,
      abi: ENSReverseRegistrarABI,
      functionName: "setName",
      args: [publicAddress],
    });

    // Execute the setName transaction
    const setAsPrimaryNameResult = await client.writeContract(request);

    if (!!setAsPrimaryNameResult) {
      return 200;
    }
  } catch (error) {
    console.error("writing failed: ", { error });
    const errorType = getBlockchainTransactionError(error);
    return errorType;
  }
};
