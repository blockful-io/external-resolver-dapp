/* eslint-disable import/no-named-as-default */
/* eslint-disable import/named */
import ENSReverseRegistrarABI from "@/lib/abi/ens-reverse-registrar.json";
import { walletClient } from "@/lib/wallet/wallet-config";
import ETHRegistrarABI from "@/lib/abi/eth-registrar.json";
import {
  DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES,
  nameRegistrationContracts,
  nameRegistrationSCs,
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
  fromBytes,
  Address,
  PublicClient,
} from "viem";
import { isTestnet, SupportedNetwork } from "../wallet/chains";
import { sepolia, mainnet } from "viem/chains";
import { SECONDS_PER_YEAR, ENSName } from "@namehash/ens-utils";
import {
  TransactionErrorType,
  getBlockchainTransactionError,
} from "../wallet/txError";
import { getNameRegistrationSecret } from "@/lib/name-registration/localStorage";
import { parseAccount } from "viem/utils";
import DomainResolverABI from "../abi/resolver.json";
import { normalize } from "viem/ens";
import { cryptocurrencies } from "../domain-page";
import { getCoderByCoinName } from "@ensdomains/address-encoder";
import { CcipRequestParameters, DomainData, MessageData } from "./types";
import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
}

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

interface MakeCommitmentParams {
  name: string;
  data: string[];
  secret: string;
  reverseRecord: boolean;
  resolverAddress: Address;
  durationInYears: bigint;
  ownerControlledFuses: number;
  authenticatedAddress: Address;
  publicClient: PublicClient & ClientWithEns;
}

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

export async function ccipRequest({
  body,
  url,
}: CcipRequestParameters): Promise<Response> {
  return fetch(url.replace("/{sender}/{data}.json", ""), {
    body: JSON.stringify(body, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    ),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function handleDBStorage({
  domain,
  url,
  message,
  authenticatedAddress,
}: {
  domain: DomainData;
  url: string;
  message: MessageData;
  authenticatedAddress: `0x${string}`;
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
        { name: "callData", type: "bytes" },
        { name: "sender", type: "address" },
        { name: "expirationTimestamp", type: "uint256" },
      ],
    },
    primaryType: "Message",
  });

  return await ccipRequest({
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
  publicClient: PublicClient & ClientWithEns;
}

export const commit = async ({
  ensName,
  durationInYears,
  resolverAddress,
  authenticatedAddress,
  registerAndSetAsPrimaryName,
  publicClient,
}: CommitParams): Promise<`0x${string}` | TransactionErrorType> => {
  try {
    const walletClient = createCustomWalletClient(authenticatedAddress);

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
  publicClient: PublicClient & ClientWithEns;
}

export const register = async ({
  ensName,
  resolverAddress,
  durationInYears,
  authenticatedAddress,
  registerAndSetAsPrimaryName,
  publicClient,
}: RegisterParams): Promise<`0x${string}` | TransactionErrorType> => {
  try {
    const walletClient = createCustomWalletClient(authenticatedAddress);

    const client = walletClient.extend(publicActions);

    if (!client) throw new Error("WalletClient not found");

    const nameWithoutTLD = ensName.name.replace(".eth", "");

    const namePrice = await getNamePrice({
      ensName,
      durationInYears,
      publicClient,
    });

    const txHash = await client.writeContract({
      address: nameRegistrationContracts.ETH_REGISTRAR,
      chain: isTestnet ? sepolia : mainnet,
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

const cryptocurrenciesToCoinType: { [k: string]: string } = {
  [cryptocurrencies.BTC]: "0",
  [cryptocurrencies.LTC]: "2",
  [cryptocurrencies.DOGE]: "3",
  [cryptocurrencies.ETH]: "60",
  [cryptocurrencies.BNB]: "714",
  [cryptocurrencies.ARB1]: "2147525809",
  [cryptocurrencies.OP]: "2147483658",
  [cryptocurrencies.MATIC]: "2147483658",
};

/*
  3rd step of a name registration - set text records
*/
export const setDomainRecords = async ({
  ensName,
  resolverAddress,
  domainResolverAddress,
  authenticatedAddress,
  textRecords,
  addresses,
}: {
  ensName: ENSName;
  resolverAddress?: Address;
  domainResolverAddress?: `0x${string}`;
  authenticatedAddress: `0x${string}`;
  textRecords: Record<string, string>;
  addresses: Record<string, string>;
}) => {
  try {
    const publicAddress = normalize(ensName.name);

    const client = walletClient.extend(publicActions);

    if (!client) throw new Error("WalletClient not found");

    // duplicated function logic on service.ts - createSubdomain
    const calls: Hash[] = [];

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

    for (let i = 0; i < Object.keys(addresses).length; i++) {
      const [cryptocurrencyName, address] = Object.entries(addresses)[i];
      if (
        !Object.keys(cryptocurrencies).includes(
          cryptocurrencyName.toUpperCase()
        )
      ) {
        console.error(`cryptocurrency ${cryptocurrencyName} not supported`);
        continue;
      }
      const coinType =
        cryptocurrenciesToCoinType[cryptocurrencyName.toUpperCase()];
      const coder = getCoderByCoinName(cryptocurrencyName.toLocaleLowerCase());
      const addressEncoded = fromBytes(coder.decode(address), "hex");
      const callData = encodeFunctionData({
        functionName: "setAddr",
        abi: DomainResolverABI,
        args: [namehash(publicAddress), coinType, addressEncoded],
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

      await client.simulateContract({
        functionName: "multicall",
        abi: DomainResolverABI,
        args: [calls],
        account: authenticatedAddress,
        address: localResolverAddress,
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

/*
  4th step of a name registration - set domain as primary name if user wants
*/
export const setDomainAsPrimaryName = async ({
  authenticatedAddress,
  ensName,
}: {
  authenticatedAddress: `0x${string}`;
  ensName: ENSName;
}) => {
  try {
    // Create a wallet client for sending transactions to the blockchain
    const walletClient = createWalletClient({
      chain: isTestnet ? sepolia : mainnet,
      transport: custom(window.ethereum),
      account: authenticatedAddress,
    });

    const client = walletClient.extend(publicActions);

    if (!client) throw new Error("WalletClient not found");

    const nameWithTLD = ensName.name.includes(".eth")
      ? ensName.name
      : `${ensName.name}.eth`;

    const network = isTestnet
      ? SupportedNetwork.TESTNET
      : SupportedNetwork.MAINNET;

    const publicAddress = normalize(nameWithTLD);

    const { request } = await client.simulateContract({
      address: nameRegistrationSCs[network].ENS_REVERSE_REGISTRAR,
      account: authenticatedAddress,
      abi: ENSReverseRegistrarABI,
      functionName: "setName",
      args: [publicAddress],
    });

    const setAsPrimaryNameRes = await client.writeContract(request);

    if (!!setAsPrimaryNameRes) {
      return 200;
    }
  } catch (err) {
    console.error("writing failed: ", { err });
    const errorType = getBlockchainTransactionError(err);
    return errorType;
  }
};

// Error handling ⬇️

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

interface GetNamePriceParams {
  ensName: ENSName;
  durationInYears: bigint;
  publicClient: PublicClient & ClientWithEns;
}

export const getNamePrice = async ({
  ensName,
  durationInYears,
  publicClient,
}: GetNamePriceParams): Promise<bigint> => {
  const ensNameDirectSubname = ensName.name.split(".eth")[0];

  const price = await publicClient.readContract({
    args: [ensNameDirectSubname, durationInYears * SECONDS_PER_YEAR.seconds],
    address: nameRegistrationContracts.ETH_REGISTRAR,
    functionName: "rentPrice",
    abi: ETHRegistrarABI,
  });
  if (price) {
    return (price as NamePrice).base + (price as NamePrice).premium;
  } else {
    throw new Error("Error getting name price");
  }
};

interface GetGasPriceParams {
  publicClient: PublicClient & ClientWithEns;
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

export const getNameRegistrationGasEstimate = (): bigint => {
  return 47606n + 324230n;
};

interface IsNameAvailableParams {
  ensName: ENSName;
  publicClient: PublicClient & ClientWithEns;
}

export const isNameAvailable = async ({
  ensName,
  publicClient,
}: IsNameAvailableParams): Promise<boolean> => {
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
