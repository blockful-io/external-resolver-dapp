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
  getWrapperData,
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
  ResolverQueryDomainData,
  ResolverQueryDomainResponse,
  SubgraphEnsData,
} from "./interfaces";
import { metadataDomainQuery } from "./queries";
import { Address, parseAbiItem } from "viem";
import toast from "react-hot-toast";

// Ensure API key is available
const ensSubgraphApiKey = process.env.NEXT_PUBLIC_ENS_SUBGRAPH_KEY;
if (!ensSubgraphApiKey) {
  throw new Error("ENS subgraph API key not found");
}

// Fetch ENS data for a given domain
export const getENSDomainData = async (
  domain: string
): Promise<DomainData | null> => {
  // Check if the domain resolver is compatible with metadata, if not it will return an error
  try {
    const data = await getENSDomainDataThroughResolver(domain);
    const domainData = formatResolverDomainData(data);
    return domainData;
  } catch (error) {
    try {
      const data = await getENSDomainDataThroughSubgraph(domain);

      if (!data) return null;
      const domainData = await formatSubgraphDomainData(data);
      return domainData;
    } catch (error) {
      console.error(error);

      toast.error("An Error occurred while loading the data");

      // If the resolver is not compatible with the metadata API or subgraph query, return a basic domain data
      // If that fails, handleFetchENSDomainData will set the error state
      return await getBasicENSDomainData(domain);
    }
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

/**
 * Extracts the parent domain from a given ENS (Ethereum Name Service) domain.
 *
 * This function splits a domain string by periods (`.`) and returns everything
 * except the first part (the subdomain). It is commonly used to retrieve the
 * top-level domain from a full ENS domain name.
 *
 * @param {string} domain - The full ENS domain (e.g., "subdomain.something.eth").
 * @returns {string} - The parent domain (e.g., "something.eth" for input "subdomain.something.eth").
 *
 * @example
 * getParent("subdomain.something.eth"); // returns "something.eth"
 * getParent("something.eth"); // returns "eth"
 */
function getParent(domain: string): string {
  const parts = domain.split(".");

  // remove the first part and return the remaining domain
  return parts.slice(1).join(".");
}

const getBasicENSDomainData = async (name: string): Promise<DomainData> => {
  const domainAdd = await getResolver(publicClient, { name });
  const domainOwner = await getOwner(publicClient, { name });
  const wrapperData = await getWrapperData(publicClient, { name });

  return {
    owner: domainOwner?.owner ?? "0x",
    parent: getParent(name),
    subdomains: [],
    subdomainCount: 0,
    resolver: {
      id: "",
      address: domainAdd as Address,
      texts: {},
      addresses: [],
    },
    expiryDate: wrapperData?.expiry?.date?.getTime()!,
  };
};

// Reads the contract to get the metadata API, if the contract doesn't support it, an error is returned
const getENSDomainDataThroughResolver = async (
  name: string
): Promise<ResolverQueryDomainData> => {
  const resolverAdd = await getResolver(publicClient, { name });

  const metadataUrl = await publicClient.readContract({
    address: resolverAdd!,
    abi: [parseAbiItem("function metadata() returns (string)")],
    functionName: "metadata",
  });

  const graphQlClient = new GraphQLClient(metadataUrl);
  const data = await graphQlClient.request<ResolverQueryDomainResponse>(
    metadataDomainQuery,
    {
      name,
    }
  );

  return data.domain;
};

const formatSubgraphDomainData = async (
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
          label: coinName,
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

const formatResolverDomainData = (
  data: ResolverQueryDomainData
): DomainData => {
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
          label: coinName,
        };
      }),

      texts: transformedTexts,
    },
  };
};
