import * as chains from "viem/chains";

/* eslint-disable import/no-named-as-default */
/* eslint-disable import/named */
import ENSReverseRegistrarABI from "@/lib/abi/ens-reverse-registrar.json";
import ETHRegistrarABI from "@/lib/abi/eth-registrar.json";
import L1ResolverABI from "../abi/arbitrum-resolver.json";
import {
  DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES,
  nameRegistrationSmartContracts,
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
  Chain,
  stringToHex,
} from "viem";
import { SupportedNetwork } from "../wallet/chains";
import { SECONDS_PER_YEAR, ENSName } from "@namehash/ens-utils";
import {
  TransactionErrorType,
  getBlockchainTransactionError,
} from "../wallet/txError";
import { getNameRegistrationSecret } from "@/lib/name-registration/localStorage";
import { parseAccount } from "viem/utils";
import DomainResolverABI from "../abi/offchain-resolver.json";
import { normalize } from "viem/ens";
import { supportedCoinTypes } from "../domain-page";
import {
  coinNameToTypeMap,
  getCoderByCoinName,
} from "@ensdomains/address-encoder";
import { CcipRequestParameters, DomainData, MessageData } from "./types";
import { ClientWithEns } from "ensjs-monorepo/packages/ensjs/dist/types/contracts/consts";
import { getAvailable } from "ensjs-monorepo/packages/ensjs/dist/esm/public";
import toast from "react-hot-toast";
import { sepolia } from "viem/chains";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
}

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

export async function ccipRequest({
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

interface HandleDBStorageParams {
  domain: DomainData;
  url: string;
  message: MessageData;
  authenticatedAddress: `0x${string}`;
  chain: Chain;
}

export async function handleDBStorage({
  domain,
  url,
  message,
  authenticatedAddress,
  chain,
}: HandleDBStorageParams): Promise<Response> {
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
  chain: Chain;
}

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
  publicClient: PublicClient & ClientWithEns;
  chain: Chain;
}

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

      const signedData = await handleDBStorage({
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

function getChain(chainId: number): Chain | undefined {
  return (Object.values(chains) as Chain[]).find(
    (chain) => chain.id === chainId,
  )
}

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

    for (let i = 0; i < Object.keys(others).length; i++) {
      const [key, value] = Object.entries(others)[i];
      const callData = encodeFunctionData({
        functionName: "setContenthash",
        abi: L1ResolverABI,
        args: [namehash(publicAddress), stringToHex(value)], // vallue = url
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
        abi: L1ResolverABI,
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
          MessageData,
        ];

        try {
          await handleDBStorage({
            domain,
            url,
            message,
            authenticatedAddress,
            chain: chain,
          });

          return 200;
        } catch (error) {
          console.error("writing failed: ", { err });
          const errorType = getBlockchainTransactionError(err);
          return errorType;
        }
      } else if (data?.errorName === "StorageHandledByL2") {
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

interface SetDomainAsPrimaryNameParams {
  authenticatedAddress: `0x${string}`;
  ensName: ENSName;
  chain: Chain;
}

export const setDomainAsPrimaryName = async ({
  authenticatedAddress,
  ensName,
  chain,
}: SetDomainAsPrimaryNameParams) => {
  try {
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

    if (!Object.values(SupportedNetwork).includes(chain.id)) {
      throw new Error(`Unsupported network: ${chain.id}`);
    }

    const network = chain.id as SupportedNetwork;

    const publicAddress = normalize(nameWithTLD);

    const { request } = await client.simulateContract({
      address: nameRegistrationSmartContracts[network].ENS_REVERSE_REGISTRAR,
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

  const chain = publicClient.chain;

  if (!Object.values(SupportedNetwork).includes(chain.id)) {
    throw new Error(`Unsupported network: ${chain.id}`);
  }

  const nameRegistrationContracts =
    nameRegistrationSmartContracts[chain.id as SupportedNetwork];

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
  ensName: string;
  publicClient: PublicClient & ClientWithEns;
}

export const isNameAvailable = async ({
  ensName,
  publicClient,
}: IsNameAvailableParams): Promise<boolean> => {
  const result = await getAvailable(publicClient, { name: ensName });

  return result;
};
