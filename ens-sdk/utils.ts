/* eslint-disable import/no-named-as-default */
/* eslint-disable import/named */
import ETHRegistrarABI from "@/lib/abi/eth-registrar.json";
import { nameRegistrationSmartContracts } from "../lib/name-registration/constants";
import * as chains from "viem/chains";

import { defineChain, namehash } from "viem";
import { SupportedNetwork } from "../lib/wallet/chains";
import { SECONDS_PER_YEAR, ENSName } from "@namehash/ens-utils";

import { getAvailable } from "@ensdomains/ensjs/public";
import { EnsPublicClient } from "./types";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
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
  publicClient: EnsPublicClient;
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
  publicClient: EnsPublicClient;
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
  publicClient: EnsPublicClient;
}

export const isNameAvailable = async ({
  ensName,
  publicClient,
}: IsNameAvailableParams): Promise<boolean> => {
  const result = await getAvailable(publicClient, { name: ensName });

  return result;
};

export function getChain(chainId: number) {
  return [
    ...Object.values(chains),
    defineChain({
      id: Number(chainId),
      name: "Arbitrum Local",
      nativeCurrency: {
        name: "Arbitrum Sepolia Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: [
            `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_TESTNET_KEY}`,
          ],
        },
      },
    }),
  ].find((chain) => chain.id === chainId);
}

// gather the first part of the domain (e.g. floripa.blockful.eth -> floripa, floripa.normal.blockful.eth -> floripa.normal)
const extractLabelFromName = (name: string): string => {
  const [, label] = /^(.+?)\.\w+\.\w+$/.exec(name) || [];
  return label;
};
