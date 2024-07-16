import { client, publicClient } from "../wallet/wallet-config";
import { isTestnet } from "../wallet/chains";
import { defaultTextRecords } from "@/types/textRecords";
import { ETHEREUM_ADDRESS_REGEX } from "../name-registration/constants";
import {
  getAvailable,
  getExpiry,
  getName,
  getOwner,
  getRecords,
} from "@ensdomains/ensjs/public";
import { getSubgraphRecords } from "@ensdomains/ensjs/subgraph";
import { DecodedAddr } from "@ensdomains/ensjs/dist/types/types";
import { normalize } from "path";

// ENS Domain Data query
const ensSubgraphApiKey = process.env.NEXT_PUBLIC_ENS_SUBGRAPH_KEY;

if (!ensSubgraphApiKey) {
  throw new Error("ENS subgraph API key not found");
}

export const ENS_SUBGRAPH_ENDPOINT = isTestnet
  ? `https://gateway-arbitrum.network.thegraph.com/api/${ensSubgraphApiKey}/subgraphs/id/DmMXLtMZnGbQXASJ7p1jfzLUbBYnYUD9zNBTxpkjHYXV`
  : `https://gateway-arbitrum.network.thegraph.com/api/${ensSubgraphApiKey}/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH`;

// ENS Domain Data interface
interface TextRecords {
  [key: string]: string | undefined;
}
export interface CoinInfo {
  id: string;
  name: string;
  value: string;
}
interface ResolvedEnsData {
  expiry?: number;
  coins?: DecodedAddr[];
  texts?: TextRecords;
  owner?: string;
}

// ENS Domain Coins utils
export enum DomainAddressesSupportedCryptocurrencies {
  BTC = "BTC",
  LTC = "LTC",
  DOGE = "DOGE",
  ETH = "ETH",
  BNB = "BNB",
}

export const cryptocurrencyToCoinType = {
  [DomainAddressesSupportedCryptocurrencies.BTC]: "0",
  [DomainAddressesSupportedCryptocurrencies.LTC]: "2",
  [DomainAddressesSupportedCryptocurrencies.DOGE]: "3",
  [DomainAddressesSupportedCryptocurrencies.ETH]: "60",
  [DomainAddressesSupportedCryptocurrencies.BNB]: "714",
};

export const cryptocurrenciesToSymbol = {
  [DomainAddressesSupportedCryptocurrencies.BTC]: "₿",
  [DomainAddressesSupportedCryptocurrencies.LTC]: "Ł",
  [DomainAddressesSupportedCryptocurrencies.DOGE]: "Ð",
  [DomainAddressesSupportedCryptocurrencies.ETH]: "Ξ",
  [DomainAddressesSupportedCryptocurrencies.BNB]: "₿",
};

export async function getENSDomainData(
  domain: string
): Promise<ResolvedEnsData | null> {
  if (!(ETHEREUM_ADDRESS_REGEX.test(domain) || domain?.endsWith(".eth")))
    throw new Error(`Invalid ENS domain or ethereum address: ${domain}`);

  const isDomainAvailable = await getAvailable(client, { name: domain });

  if (isDomainAvailable) {
    return null;
  }

  const resulto = await getSubgraphRecords(client, { name: domain });

  const availableTextRecords = isTestnet ? defaultTextRecords : resulto?.texts;

  let textRecords = await getRecords(publicClient, {
    name: domain,
    texts: availableTextRecords?.length
      ? availableTextRecords
      : defaultTextRecords,
    coins: ["ETH"],
    contentHash: true,
  });

  const transformedTexts = textRecords.texts.reduce<Record<string, string>>(
    (acc, item) => {
      acc[item.key] = item.value;
      return acc;
    },
    {}
  );

  const newAvatar = await publicClient.getEnsAvatar({
    name: normalize(domain),
  });

  const updatedTexts: Record<string, string> = Object.keys(
    transformedTexts
  ).reduce((acc, key) => {
    if (key === "avatar" && newAvatar) {
      acc[key] = newAvatar;
    } else {
      acc[key] = transformedTexts[key];
    }
    return acc;
  }, {} as Record<string, string>);

  const owner = await getOwner(publicClient, { name: domain });

  const expiry = await getExpiry(publicClient, { name: domain });

  let ownerName;
  if (owner?.owner) {
    ownerName = await getName(publicClient, {
      address: owner?.owner,
    });
  }

  // Update textRecords with the transformed object
  const updatedTextRecords = {
    ...textRecords,
    texts: updatedTexts,
    owner: ownerName?.name ?? owner?.owner,
    expiry: expiry?.expiry?.date?.getTime(),
  };

  return updatedTextRecords;
}
