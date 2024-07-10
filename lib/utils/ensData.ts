import { publicClient } from "../wallet/wallet-config";
import { normalize, packetToBytes } from "viem/ens";
import assert from "assert";
import { Abi, Hash, getContract, namehash, toHex } from "viem";
import { SupportedNetwork, isTestnet } from "../wallet/chains";
import { defaultTextRecords } from "@/types/textRecords";
import {
  ETHEREUM_ADDRESS_REGEX,
  nameRegistrationSCs,
} from "../name-registration/constants";
import ResolverABI from "@/lib/abi/resolver.json";
import { formatsByCoinType } from "@ensdomains/address-encoder";

// ENS Domain Data query
const ensSubgraphApiKey = process.env.NEXT_PUBLIC_ENS_SUBGRAPH_KEY;

if (!ensSubgraphApiKey) {
  throw new Error("ENS subgraph API key not found");
}

export const ENS_SUBGRAPH_ENDPOINT = isTestnet
  ? `https://gateway-arbitrum.network.thegraph.com/api/${ensSubgraphApiKey}/subgraphs/id/DmMXLtMZnGbQXASJ7p1jfzLUbBYnYUD9zNBTxpkjHYXV`
  : `https://gateway-arbitrum.network.thegraph.com/api/${ensSubgraphApiKey}/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH`;

const ENS_DOMAIN_TEXT_RECORDS_QUERY = `
    query($domain: String!) {
        domains(where:{name: $domain}) { 
            resolvedAddress {
                    id
                }
            resolver {
                texts
                coinTypes
            }
            parent {
                name
            }
            expiryDate
            owner {
                id
            }
        }
    }
`;

// ENS Domain Data interface
interface TextRecords {
  [key: string]: string | undefined;
}
interface CoinInfo {
  coinName: string;
  address: string;
}
interface ResolvedEnsData {
  ownerId: `0x${string}` | null;
  address: `0x${string}` | null;
  parentName: string | null;
  expiryDate: string | null;
  coinTypes: CoinInfo[] | null;
  textRecords: TextRecords | null;
}

// ENS Domain Coins utils
export enum CoinType {
  BTC = "0",
  LTC = "2",
  DOGE = "3",
  ETH = "60",
  BNB = "714",
}

// ENS Data network requests
const fetchEnsDataRequest = async (domain: string) => {
  const res = await fetch(ENS_SUBGRAPH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: ENS_DOMAIN_TEXT_RECORDS_QUERY,
      variables: { domain },
    }),
  });

  assert.strictEqual(200, res.status);

  const json = await res.json();

  return json.data.domains[0];
};

const fetchENSDomainTextRecords = async (
  domain: string,
  textKeys: string[]
): Promise<Record<string, string>> => {
  const records: Record<string, string> = {};

  const promises = textKeys.map(async (key) => {
    try {
      let ensText;
      if (key === "avatar") {
        ensText = await publicClient.getEnsAvatar({
          name: normalize(domain),
        });
        records[key] = ensText ?? "";
      } else {
        ensText = await publicClient.getEnsText({
          name: normalize(domain),
          key,
        });
        ensText && (records[key] = ensText);
      }
    } catch (error) {
      console.error(`Error fetching text record for key ${key}:`, error);
      records[key] = "Error fetching record";
    }
  });
  await Promise.all(promises);

  return records;
};

const fetchENSDomainCoinsAddresses = async (
  domainName: string
): Promise<CoinInfo[]> => {
  console.log("Object.values(CoinType)", Object.values(CoinType));
  if (!Object.keys(CoinType)) return [];
  const coinsMapping = Object.keys(CoinType).reduce(
    (prev: any, coin, idx) => ({
      ...prev,
      [idx]: coin,
    }),
    0
  );

  const ensResolverAddr: `0x${string}` = await publicClient.getEnsResolver({
    name: domainName,
  });

  const ensResolverContract = getContract({
    address: ensResolverAddr,
    client: publicClient,
    abi: ResolverABI as Abi,
  });

  const coinTypesAddressesGetters = Object.values(CoinType).map(
    (coin: string) => {
      return {
        ...ensResolverContract,
        functionName: "addr",
        args: [namehash(domainName), parseInt(coin)],
      };
    }
  );

  const multicallResult = await publicClient.multicall({
    contracts: coinTypesAddressesGetters,
    multicallAddress: ensResolverAddr,
  });

  console.log(coinTypesAddressesGetters, multicallResult);
  const coinsNamesMappedToAddresses = multicallResult.map(
    ({ status, result }, idx) => {
      if (status !== "success") return { coinName: "", address: "" };

      const coinAcronym = coinsMapping[idx];
      console.log(coinAcronym);
      let address = String(result);

      if (coinAcronym !== CoinType.ETH) {
        /*
          Below is needed because different coins have different address
          encoding formats. e.g. BTC -> P2PKH, ETH -> ChecksummedHex
        */
        const addrWithout0x = address.substring(2); // omit 0x
        const addrBuffer = Buffer.from(addrWithout0x, "hex");

        try {
          address = formatsByCoinType[coinAcronym].encoder(addrBuffer);
        } catch (e: any) {
          console.error(
            "Error when decoding address of coin ID: ",
            coinAcronym
          );
          return {
            coinName: Object.keys(CoinType)[coinsMapping[idx]],
            address: "",
          };
        }
      }

      return {
        coinName: Object.keys(CoinType)[coinsMapping[idx]],
        address,
      };
    }
  );

  return coinsNamesMappedToAddresses;
};

export async function getENSData(
  domain: string
): Promise<ResolvedEnsData | null> {
  if (!(ETHEREUM_ADDRESS_REGEX.test(domain) || domain?.endsWith(".eth")))
    throw new Error(`Invalid ENS domain or ethereum address: ${domain}`);

  const ens = await fetchEnsDataRequest(domain);

  if (!!ens) {
    let returnedData: ResolvedEnsData = {
      ownerId: ens.owner?.id,
      address: null,
      expiryDate: ens.expiryDate,
      parentName: ens.parent?.name,
      coinTypes: [],
      textRecords: {},
    };

    // Fetch coins addresses
    try {
      const domainWithEth = domain.includes(".eth") ? domain : `${domain}.eth`;

      console.log(
        "contract",
        nameRegistrationSCs[
          isTestnet ? SupportedNetwork.TESTNET : SupportedNetwork.MAINNET
        ].UNIVERSAL_RESOLVER
      );
      console.log(
        "toHex(packetToBytes(domainWithEth))",
        toHex(packetToBytes(domainWithEth))
      );
      const coinsAddresses = await fetchENSDomainCoinsAddresses(domainWithEth);

      console.log("coinsAddresses", coinsAddresses);
      returnedData = {
        ...returnedData,
        coinTypes: coinsAddresses,
      };
    } catch (error) {
      console.error("Error fetching coins addresses: ", error);
    }

    // Fetch text records
    const availableTextRecords = isTestnet
      ? defaultTextRecords
      : ens.resolver.texts;

    if (!!availableTextRecords) {
      await fetchENSDomainTextRecords(domain, availableTextRecords).then(
        (records) => {
          returnedData = {
            ...returnedData,
            textRecords: records,
          };
        }
      );
    }

    return returnedData;
  } else {
    return null;
  }
}
