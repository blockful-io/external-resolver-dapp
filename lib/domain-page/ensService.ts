import { client, publicClient } from "../wallet/wallet-config";
import { defaultTextRecords } from "@/types/textRecords";
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
import { GraphQLClient } from "graphql-request";
import { normalize } from "viem/ens";
import {
  getSupportedCoins,
  transformTextRecords,
  updateAvatarInTexts,
  validateDomain,
} from "./utils";
import {
  DomainData,
  QueryDomain,
  QueryResponse,
  SubgraphEnsDate,
} from "./interfaces";
import { query } from "./queries";
import { parseAbiItem } from "viem";

// Ensure API key is available
const ensSubgraphApiKey = process.env.NEXT_PUBLIC_ENS_SUBGRAPH_KEY;
if (!ensSubgraphApiKey) {
  throw new Error("ENS subgraph API key not found");
}

// Main Functions
export const fetchDomainData = async (
  domain: string
): Promise<DomainData | null> => {
  try {
    const data = await fetchDomainDataThroughResolver(domain);
    const domainData = formatDomainDataThroughResolver(data);

    console.log("fetchDomainDataThroughResolver", domainData);
    return domainData;
  } catch (error) {
    const data = await getENSDomainDataThroughSubgraph(domain);
    if (!data) return null;

    const domainData = await formatENSDomainDataThroughSubgraph(data);
    console.log("getENSDomainDataThroughSubgraph", domainData);
    return domainData;
  }
};

export const getENSDomainDataThroughSubgraph = async (
  domain: string
): Promise<SubgraphEnsDate | null> => {
  validateDomain(domain);

  if (await getAvailable(client, { name: domain })) return null;

  const textRecordsKeys = await getSubgraphRecords(client, { name: domain });
  const availableTextRecords = textRecordsKeys?.texts.length
    ? textRecordsKeys?.texts
    : defaultTextRecords;

  const [newAvatar, batchResults] = await Promise.all([
    publicClient.getEnsAvatar({ name: normalize(domain) }),
    batch(
      client,
      getRecords.batch({
        name: domain,
        texts: availableTextRecords,
        coins: getSupportedCoins(),
        contentHash: true,
      }),
      getOwner.batch({ name: domain }),
      getExpiry.batch({ name: domain }),
      getResolver.batch({ name: domain })
    ),
  ]);

  const [textRecords, owner, expiry] = batchResults;

  const data: SubgraphEnsDate = {
    newAvatar,
    ...textRecords,
    ...owner,
    owner: owner?.owner ?? "0x",
    ...expiry,
  };

  console.log("SUBGRAPH DATA", data, newAvatar);
  return data;
};

const fetchDomainDataThroughResolver = async (
  name: string
): Promise<QueryDomain> => {
  const resolverAdd = await getResolver(publicClient, { name });
  const metadataUrl = await publicClient.readContract({
    address: resolverAdd!,
    abi: [parseAbiItem("function metadata() returns (string)")],
    functionName: "metadata",
  });

  const graphQlClient = new GraphQLClient(metadataUrl);
  const data = await graphQlClient.request<QueryResponse>(query, { name });

  return data.domain;
};

const formatENSDomainDataThroughSubgraph = async (
  data: SubgraphEnsDate
): Promise<DomainData> => {
  const transformedTexts = transformTextRecords(data.texts);

  const updatedTexts = updateAvatarInTexts(transformedTexts, data.newAvatar);

  const ownerName = data.owner
    ? await getName(publicClient, { address: data.owner })
    : undefined;

  const domainData: DomainData = {
    owner: ownerName?.name ?? data.owner,
    resolver: {
      id: "id",
      address: data.resolverAddress,
      texts: updatedTexts,
      addresses: data.coins.map((coin) => ({
        address: coin.value,
        coin: coin.id.toString(),
      })),
    },
    expiryDate: data.expiry?.date?.getTime()!,
    subdomains: [],
    subdomainCount: 0,
    id: "id",
    resolvedAddress: "0x",
    parent: "eth",
  };

  console.log("getENSDomainDataThroughSubgraph", domainData);
  return domainData;
};

const formatDomainDataThroughResolver = (data: QueryDomain): DomainData => {
  const transformedTexts = transformTextRecords(data.resolver.texts);

  return {
    ...data,
    expiryDate: parseInt(data.expiryDate),
    resolver: {
      ...data.resolver,
      texts: transformedTexts,
    },
  };
};
