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
  // check if the resolver supports ENSIP-16 - https://viem.sh/docs/contract/readContract.html
  try {
    const domainData = await fetchDomainDataThroughResolver(domain);

    console.log("domainData", domainData);
  } catch (error) {
    const domainData = await getENSDomainDataThroughSubgraph(domain);

    console.log("domainData ", domainData);
  }
};

// If it doesn't: Fetch basic text records and coins through Subgraph

export async function getENSDomainDataThroughSubgraph(
  domain: string
): Promise<ResolvedEnsData | null> {
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

  const updatedTextRecords = {
    ...textRecords,
    texts: updatedTexts,
    owner: ownerName?.name ?? owner?.owner,
    expiry: expiry?.expiry?.date?.getTime(),
  };

  console.log("getENSDomainDataThroughSubgraph", updatedTextRecords);

  return updatedTextRecords;
}

const query = gql`
  query Query($name: String!) {
    domain(name: $name) {
      id
      context
      owner
      name
      node
      label
      labelhash
      resolvedAddress
      parent
      parentNode
      subdomains
      subdomainCount
      resolver {
        id
        node
        context
        addr
        contentHash
        texts {
          key
          value
        }
        addresses {
          address
          coin
        }
        address
      }
      expiryDate
      registerDate
    }
  }
`;

interface Domain {
  id: string;
  context: string;
  owner: string;
  name: string;
  node: string;
  label: string;
  labelhash: string;
  resolvedAddress: string;
  parent: string;
  parentNode: string;
  subdomains: string[];
  subdomainCount: number;
  resolver: {
    id: string;
    node: string;
    context: string;
    address: string;
    addr: string;
    contentHash: string;
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
  registerDate: string;
}

interface QueryResponse {
  domain: Domain;
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
  return data.domain;
}
