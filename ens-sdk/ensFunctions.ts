/* eslint-disable import/no-named-as-default */
/* eslint-disable import/named */
import ENSReverseRegistrarABI from "@/lib/abi/ens-reverse-registrar.json";
import ETHRegistrarABI from "@/lib/abi/eth-registrar.json";
import L1ResolverABI from "../lib/abi/arbitrum-resolver.json";
import {
  DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES,
  nameRegistrationSmartContracts,
} from "../lib/name-registration/constants";

import {
  namehash,
  publicActions,
  type WalletClient,
  encodeFunctionData,
  createWalletClient,
  custom,
  Hash,
  fromBytes,
  Address,
  PublicClient,
  Chain,
  stringToHex,
} from "viem";
import { SupportedNetwork } from "../lib/wallet/chains";
import { SECONDS_PER_YEAR, ENSName } from "@namehash/ens-utils";
import {
  TransactionErrorType,
  getBlockchainTransactionError,
} from "../lib/wallet/txError";
import { getNameRegistrationSecret } from "@/lib/name-registration/localStorage";
import { parseAccount } from "viem/utils";
import DomainResolverABI from "../lib/abi/offchain-resolver.json";
import { normalize } from "viem/ens";
import { supportedCoinTypes } from "../lib/domain-page";
import {
  coinNameToTypeMap,
  getCoderByCoinName,
} from "@ensdomains/address-encoder";
import {
  CcipRequestParameters,
  DomainData,
  MessageData,
} from "../lib/utils/types";
import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";
import { getAvailable } from "@ensdomains/ensjs/public";
import toast from "react-hot-toast";
import { sepolia } from "viem/chains";
import { getChain, getNamePrice } from "./utils";
import { getRevertErrorData } from "./errorHandling";
import { EnsPublicClient } from "./types";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
}

/*
  This file contains functions for ENS operations:
  - Creating subdomains
  - Creating domains with records (using a different resolver)
  - Setting a domain as the primary name
  - Setting text records
  - Setting addresses
  - Setting ABI / contenthash
*/

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

/**
 * Sends a CCIP (Cross-Chain Interoperability Protocol) request
 *
 * This function is used to send off-chain requests, typically for resolving ENS names
 * or storing data related to ENS operations.
 *
 * @param {CcipRequestParameters} params - The parameters for the CCIP request
 * @returns {Promise<Response>} - The response from the CCIP request
 */
export async function sendCcipRequest({
  body,
  url,
}: CcipRequestParameters): Promise<Response> {
  return fetch(url.replace("/{sender}/{data}.json", ""), {
    body: JSON.stringify(body, (_, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

interface HandleDbStorageParams {
  domain: DomainData;
  url: string;
  message: MessageData;
  authenticatedAddress: `0x${string}`;
  chain: Chain;
}

/**
 * Stores ENS-related data in an off-chain database
 *
 * This function is used when certain ENS operations require off-chain storage.
 * It signs the data with the user's wallet and sends it to a specified URL for storage.
 *
 * @param {HandleDbStorageParams} params - The parameters for storing data
 * @returns {Promise<Response>} - The response from the storage request
 */
export async function storeDataInDb({
  domain,
  url,
  message,
  authenticatedAddress,
  chain,
}: HandleDbStorageParams): Promise<Response> {
  const client = createWalletClient({
    account: authenticatedAddress,
    chain: chain,
    transport: custom(window.ethereum),
  });

  const signature = await client.signTypedData({
    domain,
    message,
    types: {
      Message: [
        { name: "callData", type: "bytes" },
        { name: "sender", type: "address" },
        { name: "expirationTimestamp", type: "uint256" },
      ],
    },
    primaryType: "Message",
  });

  return await sendCcipRequest({
    body: {
      data: message.callData,
      signature: { message, domain, signature },
      sender: message.sender,
    },
    url,
  });
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

/*
  3rd step of a name registration - set text records
*/

interface SetDomainRecordsParams {
  ensName: ENSName;
  resolverAddress?: Address;
  domainResolverAddress?: `0x${string}`;
  authenticatedAddress: Address;
  textRecords: Record<string, string>;
  addresses: Record<string, string>;
  others: Record<string, string>;
  client: PublicClient & WalletClient;
  chain: Chain;
}

/**
 * Sets various records for an ENS domain
 *
 * This function allows setting text records, addresses, and other records for an ENS domain.
 * It can handle both on-chain and off-chain storage depending on the resolver configuration.
 *
 * @param {SetDomainRecordsParams} params - The parameters for setting domain records
 * @returns {Promise<number | TransactionErrorType>} - A status code or an error
 */
export const setDomainRecords = async ({
  ensName,
  resolverAddress,
  domainResolverAddress,
  authenticatedAddress,
  textRecords,
  addresses,
  others,
  client,
  chain,
}: SetDomainRecordsParams) => {
  try {
    const publicAddress = normalize(ensName.name);

    // Prepare calls for setting various records
    const calls: Hash[] = [];

    // Add calls for text records
    for (let i = 0; i < Object.keys(textRecords).length; i++) {
      const key = Object.keys(textRecords)[i];
      const value = textRecords[key];

      if (value !== null && value !== undefined) {
        const callData = encodeFunctionData({
          functionName: "setText",
          abi: DomainResolverABI,
          args: [namehash(publicAddress), key, value],
        });

        calls.push(callData);
      }
    }

    // Add calls for address records
    for (let i = 0; i < Object.keys(addresses).length; i++) {
      const [cryptocurrencyName, address] = Object.entries(addresses)[i];
      if (supportedCoinTypes.includes(cryptocurrencyName.toUpperCase())) {
        console.error(`cryptocurrency ${cryptocurrencyName} not supported`);
        continue;
      }

      const coinType =
        coinNameToTypeMap[cryptocurrencyName as keyof typeof coinNameToTypeMap];

      const coder = getCoderByCoinName(cryptocurrencyName.toLocaleLowerCase());
      const addressEncoded = fromBytes(coder.decode(address), "hex");
      const callData = encodeFunctionData({
        functionName: "setAddr",
        abi: DomainResolverABI,
        args: [namehash(publicAddress), BigInt(coinType), addressEncoded],
      });
      calls.push(callData);
    }

    // Add calls for other records (e.g., contenthash)
    for (let i = 0; i < Object.keys(others).length; i++) {
      const [key, value] = Object.entries(others)[i];
      const callData = encodeFunctionData({
        functionName: "setContenthash",
        abi: L1ResolverABI,
        args: [namehash(publicAddress), stringToHex(value)], // value = url
      });
      calls.push(callData);
    }

    try {
      let localResolverAddress;

      if (resolverAddress) {
        localResolverAddress = resolverAddress;
      } else if (domainResolverAddress) {
        localResolverAddress = domainResolverAddress;
      } else {
        throw new Error("No domain resolver informed");
      }

      // Simulate the multicall contract interaction
      await client.simulateContract({
        functionName: "multicall",
        abi: L1ResolverABI,
        args: [calls],
        account: authenticatedAddress,
        address: localResolverAddress,
      });
    } catch (error) {
      const data = getRevertErrorData(error);
      if (data?.errorName === "StorageHandledByOffChainDatabase") {
        // Handle off-chain storage
        const [domain, url, message] = data.args as [
          DomainData,
          string,
          MessageData,
        ];

        try {
          await storeDataInDb({
            domain,
            url,
            message,
            authenticatedAddress,
            chain: chain,
          });

          return 200;
        } catch (error) {
          console.error("writing failed: ", { error });
          const errorType = getBlockchainTransactionError(error);
          return errorType;
        }
      } else if (data?.errorName === "StorageHandledByL2") {
        // Handle L2 storage
        const [chainId, contractAddress] = data.args as [bigint, `0x${string}`];

        const selectedChain = getChain(Number(chainId));

        if (!selectedChain) {
          toast.error("error");
          return;
        }

        const clientWithWallet = createWalletClient({
          chain: selectedChain,
          transport: custom(window.ethereum),
        }).extend(publicActions);

        await clientWithWallet.addChain({ chain: selectedChain });

        try {
          const { request } = await clientWithWallet.simulateContract({
            functionName: "multicall",
            abi: L1ResolverABI,
            args: [calls],
            account: authenticatedAddress,
            address: contractAddress,
          });
          await clientWithWallet.writeContract(request);
        } catch {
          await clientWithWallet.switchChain({ id: sepolia.id });
        }

        await clientWithWallet.switchChain({ id: sepolia.id });

        return 200;
      } else {
        console.error("writing failed: ", { error });
        const errorType = getBlockchainTransactionError(error);
        return errorType;
      }
    }
  } catch (error: unknown) {
    console.error(error);
    const errorType = getBlockchainTransactionError(error);
    return errorType;
  }
};

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
