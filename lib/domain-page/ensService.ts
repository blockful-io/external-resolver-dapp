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
  getCoinNameByType,
  getSupportedCoins,
  transformTextRecords,
  updateAvatarInTexts,
  validateDomain,
} from "./utils";
import {
  DomainData,
  QueryDomain,
  QueryResponse,
  SubgraphEnsData,
} from "./interfaces";
import { query } from "./queries";
import { ContractFunctionExecutionError, parseAbiItem } from "viem";
import toast from "react-hot-toast";

// Ensure API key is available
const ensSubgraphApiKey = process.env.NEXT_PUBLIC_ENS_SUBGRAPH_KEY;
if (!ensSubgraphApiKey) {
  throw new Error("ENS subgraph API key not found");
}

// Fetch ENS data for a given domain
export const fetchDomainData = async (
  domain: string
): Promise<DomainData | null> => {
  // Check if the domain resolver is compatible with metadata, if nor it will return an error
  try {
    const data = await fetchDomainDataThroughResolver(domain);
    const domainData = formatDomainDataThroughResolver(data);
    return domainData;
    // Case where it's not compatilble
  } catch (error) {
    if (error instanceof ContractFunctionExecutionError) {
      const data = await getENSDomainDataThroughSubgraph(domain);
      if (!data) return null;
      const domainData = await formatENSDomainDataThroughSubgraph(data);
      return domainData;
    } else {
      toast.error("An Error occurred while loading the data");
    }
    return null;
  }
};

// Fetch ENS data for a given domain through subgraph
export const getENSDomainDataThroughSubgraph = async (
  domain: string
): Promise<SubgraphEnsData | null> => {
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

  const data: SubgraphEnsData = {
    newAvatar,
    ...textRecords,
    ...owner,
    owner: owner?.owner ?? "0x",
    ...expiry,
  };

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
  data: SubgraphEnsData
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
      addresses: data.coins.map((coin) => {
        const coinName = getCoinNameByType(coin.id.toString());

        return {
          address: coin.value,
          name: coinName,
          coin: coin.id.toString(),
        };
      }),
    },
    expiryDate: data.expiry?.date?.getTime()!,
    subdomains: [],
    subdomainCount: 0,
    parent: "eth",
  };

  return domainData;
};

const formatDomainDataThroughResolver = (data: QueryDomain): DomainData => {
  const transformedTexts = transformTextRecords(data.resolver.texts);

  return {
    ...data,
    expiryDate: parseInt(data.expiryDate),
    resolver: {
      ...data.resolver,
      addresses: data.resolver.addresses.map((address) => {
        const coinName = getCoinNameByType(address.coin);
        return {
          ...address,
          name: coinName,
        };
      }),

      texts: transformedTexts,
    },
  };
};
