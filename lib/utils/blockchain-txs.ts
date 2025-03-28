/* eslint-disable import/no-named-as-default */
/* eslint-disable import/named */
import ENSReverseRegistrarABI from "@/lib/abi/ens-reverse-registrar.json";
import ETHRegistrarABI from "@/lib/abi/eth-registrar.json";
import {
  DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES,
  nameRegistrationSmartContracts,
} from "../name-registration/constants";

import {
  namehash,
  publicActions,
  createWalletClient,
  custom,
  BaseError,
  RawContractError,
  Address,
  PublicClient,
  Chain,
} from "viem";
import { SupportedNetwork } from "../wallet/chains";
import { SECONDS_PER_YEAR, ENSName } from "@namehash/ens-utils";
import {
  TransactionErrorType,
  getBlockchainTransactionError,
} from "../wallet/txError";
import { getNameRegistrationSecret } from "@/lib/name-registration/localStorage";
import { parseAccount } from "viem/utils";
import { normalize } from "viem/ens";
import { ClientWithEns } from "ensjs-monorepo/packages/ensjs/dist/types/contracts/consts";
import { getAvailable } from "ensjs-monorepo/packages/ensjs/dist/esm/public";

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

  return await client.writeContract({
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
