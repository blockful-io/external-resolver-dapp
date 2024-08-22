import { client, publicClient } from "../wallet/wallet-config";
import { defaultTextRecords } from "@/types/textRecords";
import { ETHEREUM_ADDRESS_REGEX } from "../name-registration/constants";
import {
  batch,
  getAvailable,
  getExpiry,
  getName,
  getOwner,
  getRecords,
  getResolver,
} from "@ensdomains/ensjs/public";
import { getSubgraphRecords } from "@ensdomains/ensjs/subgraph";
import { DecodedAddr } from "@ensdomains/ensjs/dist/types/types";
import { GraphQLClient, gql } from "graphql-request";

import { normalize } from "viem/ens";
import { parseAbiItem } from "viem";

// ENS Domain Data query
const ensSubgraphApiKey = process.env.NEXT_PUBLIC_ENS_SUBGRAPH_KEY;

if (!ensSubgraphApiKey) {
  throw new Error("ENS subgraph API key not found");
}

// ENS Domain Data interface
export interface TextRecords {
  [key: string]: string | undefined;
}
export interface CoinInfo {
  address: string;
  coin: string;
}
export interface ResolvedEnsData {
  expiry?: number;
  coins?: DecodedAddr[];
  texts?: TextRecords;
  owner?: string;
}

export const cryptocurrencies: { [k: string]: string } = {
  BTC: "BTC",
  LTC: "LTC",
  DOGE: "DOGE",
  ETH: "ETH",
  BNB: "BNB",
  ARB1: "ARB1",
  OP: "OP",
  MATIC: "MATIC",
};

export const fetchDomainData = async (domain: string) => {
  let domainData: DomainData | null;

  // check if the resolver supports ENSIP-16
  try {
    domainData = await fetchDomainDataThroughResolver(domain);

    console.log("fetchDomainDataThroughResolver", domainData);
    return domainData;
  } catch (error) {
    domainData = await getENSDomainDataThroughSubgraph(domain);

    console.log("getENSDomainDataThroughSubgraph ", domainData);
    return domainData;
  }
};

// If it doesn't: Fetch basic text records and coins through Subgraph

export async function getENSDomainDataThroughSubgraph(
  domain: string
): Promise<DomainData | null> {
  if (!(ETHEREUM_ADDRESS_REGEX.test(domain) || domain?.endsWith(".eth")))
    throw new Error(`Invalid ENS domain or ethereum address: ${domain}`);

  const isDomainAvailable = await getAvailable(client, { name: domain });

  if (isDomainAvailable) {
    return null;
  }

  // If resolver doesnt support metadata ->
  // Get available text records keys
  const textRecordsKeys = await getSubgraphRecords(client, {
    name: domain,
  });

  const availableTextRecords = textRecordsKeys?.texts.length
    ? textRecordsKeys?.texts
    : defaultTextRecords;

  // Fetch text records from subghraph
  const [newAvatar, batchResults] = await Promise.all([
    publicClient.getEnsAvatar({
      name: normalize(domain),
    }),
    batch(
      client,
      getRecords.batch({
        name: domain,
        texts: availableTextRecords,
        coins: [
          cryptocurrencies.ETH,
          cryptocurrencies.BTC,
          cryptocurrencies.ARB1,
          cryptocurrencies.OP,
          cryptocurrencies.MATIC,
        ],
        contentHash: true,
      }),
      getOwner.batch({ name: domain }),
      getExpiry.batch({ name: domain }),
      getResolver.batch({ name: domain })
    ),
  ]);
  const textRecords = batchResults[0];
  const owner = batchResults[1];
  const expiry = batchResults[2];

  console.log("textRecords ", textRecords);
  // Format text records
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

  const domainData = {
    owner: ownerName?.name ?? owner?.owner!,
    resolver: {
      id: "id",
      address: textRecords.resolverAddress,
      texts: updatedTexts,
      addresses: textRecords.coins.map((coin) => {
        return { address: coin.value, coin: coin.id.toString() };
      }),
    },
    expiryDate: expiry?.expiry?.date?.getTime()!,
    subdomains: [],
    subdomainCount: 0,
    id: "id",
    resolvedAddress: "0x",
    parent: "eth",
  };

  console.log("getENSDomainDataThroughSubgraph", domainData);

  return domainData;
}

async function fetchDomainDataThroughResolver(name: string) {
  // Get the resolver address
  const resolverAdd = await getResolver(publicClient, {
    name: name,
  });

  // If it supports ENSIP-16: Fetch data - coins and text records based on ENSIP-16
  const metadataUrl = await publicClient.readContract({
    address: resolverAdd!, // change this address by the domain resolver
    abi: [parseAbiItem("function metadata() returns (string)")],
    functionName: "metadata",
  });

  const graphQlClient = new GraphQLClient(metadataUrl);

  const variables = { name };
  const data = await graphQlClient.request<QueryResponse>(query, variables);

  const textRecords = data.domain.resolver.texts;

  const transformedTexts = textRecords.reduce<Record<string, string>>(
    (acc, item) => {
      acc[item.key] = item.value;
      return acc;
    },
    {}
  );

  const fomarttedData: DomainData = {
    ...data.domain,
    expiryDate: parseInt(data.domain.expiryDate),
    resolver: {
      ...data.domain.resolver,
      texts: transformedTexts,
    },
  };

  return fomarttedData;
}

const query = gql`
  query Query($name: String!) {
    domain(name: $name) {
      id
      owner
      resolvedAddress
      parent
      subdomains
      subdomainCount
      resolver {
        id
        address
        texts {
          key
          value
        }
        addresses {
          address
          coin
        }
      }
      expiryDate
    }
  }
`;

interface QueryDomain {
  id: string;
  owner: string;
  resolvedAddress: string;
  parent: string;
  subdomains: string[];
  subdomainCount: number;
  resolver: {
    id: string;
    address: string;
    texts: {
      key: string;
      value: string;
    }[];
    addresses: {
      address: string;
      coin: string;
    }[];
  };
  expiryDate: string;
}

export interface DomainData {
  id: string;
  owner: string;
  resolvedAddress: string;
  parent: string;
  subdomains: string[];
  subdomainCount: number;
  resolver: {
    id: string;
    address: string;
    texts: Record<string, string>;
    addresses: {
      address: string;
      coin: string;
    }[];
  };
  expiryDate: number;
}

interface QueryResponse {
  domain: QueryDomain;
}
