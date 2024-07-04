/* eslint-disable import/no-named-as-default */
/* eslint-disable import/named */
import { publicClient, walletClient } from "@/lib/wallet/wallet-config";
import ETHRegistrarABI from "@/lib/abi/eth-registrar.json";
import {
  DEFAULT_ETH_COIN_TYPE,
  DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES,
  EnsResolver,
  ensResolverAddress,
  nameRegistrationContracts,
} from "../name-registration/constants";

import {
  namehash,
  publicActions,
  type WalletClient,
  encodeFunctionData,
  createWalletClient,
  custom,
  BaseError,
  RawContractError,
  Hash,
  Hex,
  Address,
} from "viem";
import { isTestnet } from "../wallet/chains";
import { sepolia, mainnet } from "viem/chains";
import PublicResolverABI from "@/lib/abi/public-resolver.json";
import { SECONDS_PER_YEAR, ENSName } from "@namehash/ens-utils";
import {
  TransactionErrorType,
  getBlockchainTransactionError,
} from "../wallet/txError";
import { getNameRegistrationSecret } from "@/lib/name-registration/localStorage";
import { parseAccount } from "viem/utils";
import DomainResolverABI from "../abi/resolver.json";
import { normalize } from "viem/ens";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
}

/**
 * @notice Struct used to define the domain of the typed data signature, defined in EIP-712.
 * @param name The user friendly name of the contract that the signature corresponds to.
 * @param version The version of domain object being used.
 * @param chainId The ID of the chain that the signature corresponds to (ie Ethereum mainnet: 1, Goerli testnet: 5, ...).
 * @param verifyingContract The address of the contract that the signature pertains to.
 */
export type DomainData = {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: `0x${string}`;
};

/**
 * @notice Struct used to define a parameter for off-chain Database Handler deferral.
 * @param name The variable name of the parameter.
 * @param value The string encoded value representation of the parameter.
 */
export type Parameter = {
  name: string;
  value: string;
};

/**
 * @notice Struct used to define the message context used to construct a typed data signature, defined in EIP-712,
 * to authorize and define the deferred mutation being performed.
 * @param functionSelector The function selector of the corresponding mutation.
 * @param sender The address of the user performing the mutation (msg.sender).
 * @param parameter[] A list of <key, value> pairs defining the inputs used to perform the deferred mutation.
 */
export type MessageData = {
  functionSelector: `0x${string}`;
  sender: `0x${string}`;
  parameters: Parameter[];
  expirationTimestamp: bigint;
};

const createCustomWalletClient = (account: `0x${string}`): WalletClient => {
  return createWalletClient({
    account,
    chain: isTestnet ? sepolia : mainnet,
    transport: custom(window.ethereum),
  });
};

/*
  commitment value is used in both 'commit' and 'register'
  functions in the registrar contract. It works as a secret
  to prevent frontrunning attacks. The commitment value must
  be the same in both functions calls, this is why we store
  it in the local storage.
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
}: {
  name: string;
  secret: string;
  data: string[];
  reverseRecord: boolean;
  resolverAddress: string;
  durationInYears: bigint;
  ownerControlledFuses: number;
  authenticatedAddress: `0x${string}`;
}) {
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

export type TypedSignature = {
  signature: `0x${string}`;
  domain: DomainData;
  message: MessageData;
};

export type CcipRequestParameters = {
  body: { data: Hex; signature: TypedSignature; sender: Address };
  url: string;
};

export async function ccipRequest({
  body,
  url,
}: CcipRequestParameters): Promise<Response> {
  return new Promise((resolve, reject) => {
    return fetch(url.replace("/{sender}/{data}.json", ""), {
      body: JSON.stringify(body, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      ),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => resolve(res))
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}

export async function handleDBStorage({
  domain,
  url,
  message,
  authenticatedAddress,
  multicall,
}: {
  domain: DomainData;
  url: string;
  message: MessageData;
  authenticatedAddress: `0x${string}`;
  multicall?: boolean;
}): Promise<Response> {
  const client = createWalletClient({
    account: authenticatedAddress,
    chain: isTestnet ? sepolia : mainnet,
    transport: custom(window.ethereum),
  });

  const signature = await client.signTypedData({
    domain,
    message,
    types: {
      Message: [
        { name: "functionSelector", type: "bytes4" },
        { name: "sender", type: "address" },
        { name: "parameters", type: "Parameter[]" },
        { name: "expirationTimestamp", type: "uint256" },
      ],
      Parameter: [
        { name: "name", type: "string" },
        { name: "value", type: "string" },
      ],
    },
    primaryType: "Message",
  });

  let callData;
  if (multicall) {
    callData = message.parameters[0].value as `0x${string}`;
  } else {
    callData = encodeFunctionData({
      abi: DomainResolverABI,
      functionName: message.functionSelector,
      args: message.parameters.map((arg) => arg.value),
    });
  }

  const dbRecordsSavingResponse = await ccipRequest({
    body: {
      data: callData,
      signature: { message, domain, signature },
      sender: message.sender,
    },
    url,
  });

  return dbRecordsSavingResponse;
}

/*
  1st step of a name registration
*/
export const commit = async ({
  ensName,
  domainResolver,
  durationInYears,
  authenticatedAddress,
  registerAndSetAsPrimaryName,
}: {
  ensName: ENSName;
  durationInYears: bigint;
  domainResolver: EnsResolver;
  authenticatedAddress: `0x${string}`;
  registerAndSetAsPrimaryName: boolean;
}): Promise<`0x${string}` | TransactionErrorType> => {
  try {
    const walletClient = createCustomWalletClient(authenticatedAddress);

    const client = walletClient.extend(publicActions);

    if (!client) throw new Error("WalletClient not found");

    const commitmentWithConfigHash = await makeCommitment({
      name: ensName.name.replace(".eth", ""),
      data: [],
      authenticatedAddress,
      durationInYears: durationInYears,
      secret: getNameRegistrationSecret(),
      reverseRecord: registerAndSetAsPrimaryName,
      resolverAddress: ensResolverAddress[domainResolver],
      ownerControlledFuses: DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES,
    });

    const { request } = await client.simulateContract({
      account: parseAccount(authenticatedAddress),
      address: nameRegistrationContracts.ETH_REGISTRAR,
      args: [commitmentWithConfigHash],
      functionName: "commit",
      abi: ETHRegistrarABI,
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
export const register = async ({
  ensName,
  domainResolver,
  durationInYears,
  authenticatedAddress,
  registerAndSetAsPrimaryName,
}: {
  ensName: ENSName;
  durationInYears: bigint;
  domainResolver: EnsResolver;
  authenticatedAddress: `0x${string}`;
  registerAndSetAsPrimaryName: boolean;
}): Promise<`0x${string}` | TransactionErrorType> => {
  try {
    const walletClient = createCustomWalletClient(authenticatedAddress);

    const client = walletClient.extend(publicActions);

    if (!client) throw new Error("WalletClient not found");

    const namePrice = await getNamePrice({ ensName, durationInYears });

    const txHash = await client.writeContract({
      address: nameRegistrationContracts.ETH_REGISTRAR,
      chain: isTestnet ? sepolia : mainnet,
      account: authenticatedAddress,
      args: [
        ensName.name.replace(".eth", ""),
        authenticatedAddress,
        durationInYears * SECONDS_PER_YEAR.seconds,
        getNameRegistrationSecret(),
        ensResolverAddress[domainResolver],
        [],
        registerAndSetAsPrimaryName,
        DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES,
      ],
      value: namePrice,
      abi: ETHRegistrarABI,
      functionName: "register",
    });

    return txHash;
  } catch (error: unknown) {
    const data = getRevertErrorData(error);

    if (data?.errorName === "StorageHandledByOffChainDatabase") {
      const [domain, url, message] = data.args as [
        DomainData,
        string,
        MessageData
      ];

      const signedData = await handleDBStorage({
        domain,
        url,
        message,
        authenticatedAddress,
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
export const setDomainRecords = async ({
  ensName,
  domainResolver,
  domainResolverAddress,
  authenticatedAddress,
  textRecords,
  addresses,
}: {
  ensName: ENSName;
  domainResolver?: EnsResolver;
  domainResolverAddress?: `0x${string}`;
  authenticatedAddress: `0x${string}`;
  textRecords: Record<string, string>;
  addresses: Record<string, string>;
}) => {
  try {
    const publicAddress = normalize(ensName.name);

    const client = walletClient.extend(publicActions);

    if (!client) throw new Error("WalletClient not found");

    const calls: Hash[] = [];

    for (let i = 0; i < Object.keys(textRecords).length; i++) {
      const key = Object.keys(textRecords)[i];
      const value = textRecords[key];

      if (value) {
        const callData = encodeFunctionData({
          functionName: "setText",
          abi: DomainResolverABI,
          args: [namehash(publicAddress), key, value],
        });

        calls.push(callData);
      }
    }

    for (let i = 0; i < Object.keys(addresses).length; i++) {
      const value = Object.values(addresses)[i];

      const callData = encodeFunctionData({
        functionName: "setAddr",
        abi: DomainResolverABI,
        // To be replaced when multiple coin types are supported
        args: [namehash(publicAddress), DEFAULT_ETH_COIN_TYPE, value],
      });

      calls.push(callData);
    }

    try {
      let resolverAddress;
      if (domainResolver) {
        resolverAddress = ensResolverAddress[domainResolver];
      } else if (domainResolverAddress) {
        resolverAddress = domainResolverAddress;
      } else {
        throw new Error("No domain resolver informed");
      }

      await client.simulateContract({
        functionName: "multicall",
        abi: DomainResolverABI,
        args: [calls],
        account: authenticatedAddress,
        address: resolverAddress,
      });
    } catch (err) {
      const data = getRevertErrorData(err);
      if (data?.errorName === "StorageHandledByOffChainDatabase") {
        const [domain, url, message] = data.args as [
          DomainData,
          string,
          MessageData
        ];

        try {
          await handleDBStorage({
            domain,
            url,
            message,
            authenticatedAddress,
            multicall: true,
          });

          return 200;
        } catch (error) {
          console.error("writing failed: ", { err });
          const errorType = getBlockchainTransactionError(err);
          return errorType;
        }
      } else {
        console.error("writing failed: ", { err });
        const errorType = getBlockchainTransactionError(err);
        return errorType;
      }
    }
  } catch (error: unknown) {
    console.error(error);
    const errorType = getBlockchainTransactionError(error);
    return errorType;
  }
};

export function getRevertErrorData(err: unknown) {
  if (!(err instanceof BaseError)) return undefined;
  const error = err.walk() as RawContractError;
  return error?.data as { errorName: string; args: unknown[] };
}

// Utils ⬇️

export const createNameRegistrationSecret = (): string => {
  const platformHex = namehash("blockful-ens-external-resolver").slice(2, 10);
  const platformBytes = platformHex.length;
  const randomHex = [...Array(64 - platformBytes)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");

  return "0x" + platformHex + randomHex;
};

interface NamePrice {
  base: bigint;
  premium: bigint;
}

export const getNamePrice = async ({
  ensName,
  durationInYears,
}: {
  ensName: ENSName;
  durationInYears: bigint;
}) => {
  return publicClient
    .readContract({
      args: [ensName.name, durationInYears * SECONDS_PER_YEAR.seconds],
      address: nameRegistrationContracts.ETH_REGISTRAR,
      functionName: "rentPrice",
      abi: ETHRegistrarABI,
    })
    .then((price: unknown) => {
      return (price as NamePrice).base + (price as NamePrice).premium;
    })
    .catch((error) => {
      return error;
    });
};

export const getGasPrice = async (): Promise<bigint> => {
  return publicClient
    .getGasPrice()
    .then((gasPrice) => {
      return gasPrice;
    })
    .catch((error) => {
      return error;
    });
};

export const getNameRegistrationGasEstimate = (): bigint => {
  return 47606n + 324230n;
};

export const isNameAvailable = async (ensName: ENSName): Promise<boolean> => {
  const rawName = ensName.name.split(".eth")[0];

  return publicClient
    .readContract({
      args: [rawName],
      address: nameRegistrationContracts.ETH_REGISTRAR,
      functionName: "available",
      abi: ETHRegistrarABI,
    })
    .then((available) => {
      return !!available;
    })
    .catch((error) => {
      throw new Error(error);
    });
};
