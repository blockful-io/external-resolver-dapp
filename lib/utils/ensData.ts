import { client, publicClient } from "../wallet/wallet-config";
import { isTestnet } from "../wallet/chains";
import { defaultTextRecords } from "@/types/textRecords";
import { ETHEREUM_ADDRESS_REGEX } from "../name-registration/constants";
import {
  batch,
  getAvailable,
  getExpiry,
  getName,
  getOwner,
  getRecords,
} from "@ensdomains/ensjs/public";
import { getSubgraphRecords } from "@ensdomains/ensjs/subgraph";
import { DecodedAddr } from "@ensdomains/ensjs/dist/types/types";

import { normalize } from "viem/ens";
import assert from "assert";

// ENS Domain Data query
const ensSubgraphApiKey = process.env.NEXT_PUBLIC_ENS_SUBGRAPH_KEY;

if (!ensSubgraphApiKey) {
  throw new Error("ENS subgraph API key not found");
}

export const ENS_SUBGRAPH_ENDPOINT = isTestnet
  ? `https://gateway-arbitrum.network.thegraph.com/api/${ensSubgraphApiKey}/subgraphs/id/DmMXLtMZnGbQXASJ7p1jfzLUbBYnYUD9zNBTxpkjHYXV`
  : `https://gateway-arbitrum.network.thegraph.com/api/${ensSubgraphApiKey}/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH`;

// ENS Domain Data interface
export interface TextRecords {
  [key: string]: string | undefined;
}
export interface CoinInfo {
  id: string;
  name: string;
  value: string;
}
export interface ResolvedEnsData {
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

// // ENS Data network requests
// const fetchEnsDataRequest = async (domain: string) => {
//   const res = await fetch(ENS_SUBGRAPH_ENDPOINT, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       query: ENS_DOMAIN_TEXT_RECORDS_QUERY,
//       variables: { domain },
//     }),
//   });

//   assert.strictEqual(200, res.status);

//   const json = await res.json();

//   return json.data.domains[0];
// };

// const fetchENSDomainTextRecords = async (
//   domain: string,
//   textKeys: string[]
// ): Promise<Record<string, string>> => {
//   const records: Record<string, string> = {};

//   const promises = textKeys.map(async (key) => {
//     try {
//       let ensText;
//       if (key === "avatar") {
//         ensText = await publicClient.getEnsAvatar({
//           name: normalize(domain),
//         });
//         records[key] = ensText ?? "";
//       } else {
//         ensText = await publicClient.getEnsText({
//           name: normalize(domain),
//           key,
//         });
//         ensText && (records[key] = ensText);
//       }
//     } catch (error) {
//       console.error(`Error fetching text record for key ${key}:`, error);
//       records[key] = "Error fetching record";
//     }
//   });
//   await Promise.all(promises);

//   return records;
// };

// const fetchENSDomainCoinsAddresses = async (
//   domainName: string
// ): Promise<(CoinInfo | undefined)[]> => {
//   if (!Object.keys(DomainAddressesSupportedCryptocurrencies)) return [];

//   const coinsMapping = Object.keys(
//     DomainAddressesSupportedCryptocurrencies
//   ).reduce(
//     (prev: any, coin, idx) => ({
//       ...prev,
//       [idx]: coin,
//     }),
//     0
//   );

//   const coinTypesAddressesGetters = await Promise.all(
//     Object.values(cryptocurrencyToCoinType).map((coin: string) => {
//       return publicClient.getEnsAddress({
//         coinType: parseInt(coin),
//         name: domainName,
//       });
//     })
//   );

//   const coinsNamesMappedToAddresses = coinTypesAddressesGetters.map(
//     (result, idx) => {
//       if (result === null) return;

//       const coinAcronym = coinsMapping[
//         idx
//       ] as DomainAddressesSupportedCryptocurrencies;
//       let address = String(result) !== "0x" ? String(result) : "";

//       if (
//         coinAcronym !== DomainAddressesSupportedCryptocurrencies.ETH &&
//         result !== "0x"
//       ) {
//         /*
//         Below is needed because different coins have different address
//         encoding formats. e.g. BTC -> P2PKH, ETH -> ChecksummedHex
//       */
//         const addrWithout0x = address.substring(2); // omit 0x
//         const addrBuffer = Buffer.from(addrWithout0x, "hex");

//         try {
//           address =
//             formatsByCoinType[
//               parseInt(cryptocurrencyToCoinType[coinAcronym])
//             ].encoder(addrBuffer);
//         } catch (e: any) {
//           console.error(
//             "Error when decoding address of coin ID: ",
//             coinAcronym
//           );
//           return {
//             symbol: cryptocurrenciesToSymbol[coinAcronym],
//             coinName: coinAcronym,
//             address: "",
//           };
//         }
//       } else {
//         return {
//           symbol: cryptocurrenciesToSymbol[coinAcronym],
//           coinName: coinAcronym,
//           address,
//         };
//       }
//     }
//   );

//   return coinsNamesMappedToAddresses;
// };

export async function getENSDomainData(
  domain: string
): Promise<ResolvedEnsData | null> {
  if (!(ETHEREUM_ADDRESS_REGEX.test(domain) || domain?.endsWith(".eth")))
    throw new Error(`Invalid ENS domain or ethereum address: ${domain}`);

  const isDomainAvailable = await getAvailable(client, { name: domain });

  if (isDomainAvailable) {
    return null;
  }

  const textRecordsKeys = await getSubgraphRecords(client, { name: domain });
  const availableTextRecords = isTestnet
    ? defaultTextRecords
    : textRecordsKeys?.texts;

  const [newAvatar, batchResults] = await Promise.all([
    publicClient.getEnsAvatar({
      name: normalize(domain),
    }),
    batch(
      client,
      getRecords.batch({
        name: domain,
        texts: availableTextRecords?.length
          ? availableTextRecords
          : defaultTextRecords,
        coins: ["ETH"],
        contentHash: true,
      }),
      getOwner.batch({ name: domain }),
      getExpiry.batch({ name: domain })
    ),
  ]);

  const textRecords = batchResults[0];
  const owner = batchResults[1];
  const expiry = batchResults[2];

  const transformedTexts = textRecords.texts.reduce<Record<string, string>>(
    (acc, item) => {
      acc[item.key] = item.value;
      return acc;
    },
    {}
  );

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

  let ownerName;
  if (owner?.owner) {
    ownerName = await getName(publicClient, {
      address: owner?.owner,
    });
  }

  const updatedTextRecords = {
    ...textRecords,
    texts: updatedTexts,
    owner: ownerName?.name ?? owner?.owner,
    expiry: expiry?.expiry?.date?.getTime(),
  };

  return updatedTextRecords;
}
