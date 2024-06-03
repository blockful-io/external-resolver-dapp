/* eslint-disable import/no-named-as-default */
/* eslint-disable import/named */
import { publicClient } from "@/lib/wallet/wallet-config";
import ETHRegistrarABI from "@/lib/abi/eth-registrar.json";
import {
  DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES,
  nameRegistrationContracts,
} from "./constants";

import {
  namehash,
  publicActions,
  type WalletClient,
  encodeFunctionData,
  createWalletClient,
  custom,
} from "viem";
import { isTestnet } from "../wallet/chains";
import { sepolia, mainnet } from "viem/chains";
import PublicResolverABI from "@/lib/abi/public-resolver.json";
import { SECONDS_PER_YEAR, ENSName } from "@namehash/ens-utils";
import {
  TransactionErrorType,
  getBlockchainTransactionError,
} from "../wallet/txError";
import { getNameRegistrationSecret } from "@/lib/browser/localStorage";
import { parseAccount } from "viem/utils";

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
        durationInYears * SECONDS_PER_YEAR,
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

/*
  1st step of a name registration
*/
export const commit = async ({
  ensName,
  durationInYears,
  authenticatedAddress,
  registerAndSetAsPrimaryName,
}: {
  ensName: ENSName;
  durationInYears: bigint;
  authenticatedAddress: `0x${string}`;
  registerAndSetAsPrimaryName: boolean;
}): Promise<`0x${string}` | TransactionErrorType> => {
  try {
    const walletClient = createCustomWalletClient(authenticatedAddress);

    const client = walletClient.extend(publicActions);

    if (!client) throw new Error("WalletClient not found");

    const addrCalldata = getAddrCalldata(ensName.name, authenticatedAddress);

    const commitmentWithConfigHash = await makeCommitment({
      name: ensName.name,
      data: [addrCalldata],
      authenticatedAddress,
      durationInYears: durationInYears,
      secret: getNameRegistrationSecret(),
      reverseRecord: registerAndSetAsPrimaryName,
      resolverAddress: nameRegistrationContracts.ENS_PUBLIC_RESOLVER,
      ownerControlledFuses: DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES,
    });

    const { request } = await client.simulateContract({
      chain: isTestnet ? sepolia : mainnet,
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
  value,
  ensName,
  walletClient,
  durationInYears,
  authenticatedAddress,
  registerAndSetAsPrimaryName,
}: {
  value: bigint;
  ensName: ENSName;
  durationInYears: bigint;
  walletClient: WalletClient;
  authenticatedAddress: `0x${string}`;
  registerAndSetAsPrimaryName: boolean;
}): Promise<`0x${string}` | TransactionErrorType> => {
  if (!walletClient) throw new Error("WalletClient not found");

  const client = walletClient.extend(publicActions);

  const addrCalldata = getAddrCalldata(ensName.name, authenticatedAddress);

  return client
    .writeContract({
      address: nameRegistrationContracts.ETH_REGISTRAR,
      chain: isTestnet ? sepolia : mainnet,
      account: authenticatedAddress,
      args: [
        ensName.name,
        authenticatedAddress,
        durationInYears * SECONDS_PER_YEAR,
        getNameRegistrationSecret(),
        nameRegistrationContracts.ENS_PUBLIC_RESOLVER,
        [addrCalldata],
        registerAndSetAsPrimaryName,
        DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES,
      ],
      abi: ETHRegistrarABI,
      functionName: "register",
      value: value,
    })
    .then((transactionHash) => {
      return transactionHash;
    })
    .catch((error) => {
      const errorType = getBlockchainTransactionError(error);
      return errorType;
    });
};

// Utils ⬇️

export const createNameRegistrationSecret = (): string => {
  const platformHex = namehash("blockful-ens-external-resolver").slice(2, 10);
  const platformBytes = platformHex.length;
  const randomHex = [...Array(64 - platformBytes)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");

  return "0x" + platformHex + randomHex;
};

const getAddrCalldata = (name: string, address: string) => {
  const calldata = encodeFunctionData({
    abi: PublicResolverABI,
    functionName: "setAddr",
    args: [namehash(name.concat(".eth")), 60, address],
  });

  return calldata;
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
      args: [ensName.name, durationInYears * SECONDS_PER_YEAR],
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
