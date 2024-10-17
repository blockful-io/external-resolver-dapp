import { defaultTextRecords } from "@/types/textRecords";
import {
  batch,
  getAvailable,
  getContentHashRecord,
  getExpiry,
  getName,
  getOwner,
  getRecords,
  getResolver,
  getWrapperData,
} from "@ensdomains/ensjs/public";
import { getSubgraphRecords } from "@ensdomains/ensjs/subgraph";
import { GraphQLClient } from "graphql-request";
import { normalize, packetToBytes } from "viem/ens";
import DomainResolverABI from "../abi/resolver.json";
import abiUniversalResolver from "../abi/universal-resolver.json";
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
import {
  Address,
  ContractFunctionExecutionError,
  decodeFunctionResult,
  encodeFunctionData,
  Hex,
  hexToString,
  isAddress,
  namehash,
  parseAbiItem,
  PublicClient,
  toHex,
  WalletClient,
} from "viem";
import toast from "react-hot-toast";
import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";
import { stringHasMoreThanOneDot } from "../utils/formats";
import { nameRegistrationSmartContracts } from "../name-registration/constants";
import { SupportedNetwork } from "../wallet/chains";

// Ensure API key is available
const ensSubgraphApiKey = process.env.NEXT_PUBLIC_ENS_SUBGRAPH_KEY;
if (!ensSubgraphApiKey) {
  throw new Error("ENS subgraph API key not found");
}

interface GetENSDomainDataParams {
  domain: string;
  testClient?: ClientWithEns;
  client: PublicClient & ClientWithEns;
  testWalletClient?: WalletClient;
}

// Fetch ENS data for a given domain
export const getENSDomainData = async ({
  domain,
  client,
}: GetENSDomainDataParams): Promise<DomainData | null> => {
  // Check if the domain resolver is compatible with metadata, if not it will return an error
  try {
    const data = await getENSDomainDataThroughResolver({
      name: domain,
      client: client,
    });
    const domainData = formatResolverDomainData(data);
    return domainData;
  } catch (error) {
    try {
      const data = await getENSDomainDataThroughSubgraph({
        domain: domain,
        client: client,
      });

      if (!data) return null;
      const domainData = await formatSubgraphDomainData({
        data: data,
        client: client,
      });
      return domainData;
    } catch (error) {
      console.error(error);

      toast.error("An Error occurred while loading the data");

      // If the resolver is not compatible with the metadata API or subgraph query, return a basic domain data
      // If that fails, handleFetchENSDomainData will set the error state
      return await getBasicENSDomainData({
        name: domain,
        client: client,
      });
    }
  }
};

interface GetENSDomainDataThroughSubgraphParams {
  domain: string;
  client: ClientWithEns & PublicClient;
}

// Fetch ENS data for a given domain through subgraph
export const getENSDomainDataThroughSubgraph = async ({
  domain,
  client,
}: GetENSDomainDataThroughSubgraphParams): Promise<SubgraphEnsData | null> => {
  validateDomain(domain);

  if (
    !stringHasMoreThanOneDot(domain) &&
    (await getAvailable(client, { name: domain }))
  )
    return null;

  const textRecordsKeys = await getSubgraphRecords(client, {
    name: domain,
  });
  const availableTextRecords = textRecordsKeys?.texts.length
    ? textRecordsKeys?.texts
    : defaultTextRecords;

  const [newAvatar, batchResults] = await Promise.all([
    client.getEnsAvatar({ name: normalize(domain) }),
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
      getResolver.batch({ name: domain }),
      getContentHashRecord.batch({ name: domain }),
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

interface GetBasicENSDomainDataParams {
  name: string;
  client: ClientWithEns & PublicClient;
}

const getBasicENSDomainData = async ({
  name,
  client,
}: GetBasicENSDomainDataParams): Promise<DomainData> => {
  const domainAdd = (await getResolver(client, { name })) as Address;
  const domainOwner = await getOwner(client, { name });
  const wrapperData = await getWrapperData(client, { name });

  if (!isAddress(domainAdd)) {
    throw new Error(`Invalid Ethereum address: ${domainAdd}`);
  }

  return {
    owner: domainOwner?.owner ?? "0x",
    parent: getParent(name),
    subdomains: [],
    subdomainCount: 0,
    contentHash: "",
    resolver: {
      id: "",
      address: domainAdd,
      texts: {},
      addresses: [],
    },
    expiryDate: wrapperData?.expiry?.date?.getTime()!,
  };
};

interface GetENSDomainDataThroughResolverParams {
  name: string;
  client: ClientWithEns & PublicClient;
}

// Reads the contract to get the metadata API, if the contract doesn't support it, an error is returned
const getENSDomainDataThroughResolver = async ({
  name,
  client,
}: GetENSDomainDataThroughResolverParams): Promise<ResolverQueryDomainData> => {
  const resolverAdd = await getResolver(client, { name });

  if (!resolverAdd) {
    toast.error("no Resolver address");
    throw new Error("no Resolver address");
  }

  const metadataUrl = await client.readContract({
    address: resolverAdd,
    abi: [parseAbiItem("function metadata() returns (string)")],
    functionName: "metadata",
  });

  const graphQlClient = new GraphQLClient(metadataUrl);
  const data = await graphQlClient.request<ResolverQueryDomainResponse>(
    metadataDomainQuery,
    {
      name,
    },
  );

  let contentHash: string | undefined;

  try {
    const dnsName = toHex(packetToBytes(name));

    const [encodedContentHash] = (await client.readContract({
      address:
        nameRegistrationSmartContracts[SupportedNetwork.TESTNET]
          .UNIVERSAL_RESOLVER,
      functionName: "resolve",
      abi: abiUniversalResolver,
      args: [
        dnsName,
        encodeFunctionData({
          abi: DomainResolverABI,
          functionName: "contenthash",
          args: [namehash(name)],
        }),
      ],
    })) as [Hex];

    if (encodedContentHash) {
      contentHash = hexToString(
        decodeFunctionResult({
          abi: DomainResolverABI,
          functionName: "contenthash",
          data: encodedContentHash,
        }) as Hex,
      );

      data.domain.contentHash = contentHash;
    }
  } catch (error) {
    if (error instanceof ContractFunctionExecutionError) {
      console.warn("Content hash not set or not supported by this resolver");
    } else {
      console.error("Error getting content hash", error);
    }
  }

  data.domain.resolver.address = resolverAdd;

  return data.domain;
};

interface FormatSubgraphDomainDataParams {
  data: SubgraphEnsData;
  client: PublicClient & ClientWithEns;
}

const formatSubgraphDomainData = async ({
  data,
  client,
}: FormatSubgraphDomainDataParams): Promise<DomainData> => {
  const transformedTexts = transformTextRecords(data.texts);

  const updatedTexts = updateAvatarInTexts(transformedTexts, data.newAvatar);

  const ownerName = data.owner
    ? await getName(client, { address: data.owner })
    : undefined;

  const domainData: DomainData = {
    owner: ownerName?.name ?? data.owner,
    contentHash: data.contentHash?.decoded,
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
  data: ResolverQueryDomainData,
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
