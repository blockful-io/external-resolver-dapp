import assert from "assert";
import { publicClient } from "../wallet/wallet-config";
import { normalize } from "viem/ens";
import moment from "moment";
import { isAddress } from "viem";

const ENS_ENDPOINT = "https://api.thegraph.com/subgraphs/name/ensdomains/ens";

export interface ResolvedEnsData {
  ownerId: `0x${string}` | null;
  address: `0x${string}` | null;
  parentName: string | null;
  expiryDate: string | null;
  coinTypes: string[] | null;
  textRecords: ENSRecords | null;
}

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

const fetchEnsDataRequest = async (domain: string) => {
  const res = await fetch(ENS_ENDPOINT, {
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

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export interface ENSRecords {
  [key: string]: string | undefined;
}

const fetchAllEnsTextRecords = async (
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
        records[key] = ensText ?? "";
      }
    } catch (error) {
      console.error(`Error fetching text record for key ${key}:`, error);
      records[key] = "Error fetching record";
    }
  });
  await Promise.all(promises);

  return records;
};

export async function getENS(domain: string): Promise<ResolvedEnsData> {
  if (!(ADDRESS_REGEX.test(domain) || domain?.endsWith(".eth")))
    throw new Error(`Invalid ENS domain or ethereum address: ${domain}`);

  const ens = await fetchEnsDataRequest(domain);

  if (!!ens) {
    let returnedData: ResolvedEnsData = {
      ownerId: ens?.owner?.id,
      address: ens?.resolvedAddress?.id,
      expiryDate: ens?.expiryDate,
      parentName: ens?.parent?.name,
      coinTypes: ens?.resolver?.coinTypes,
      textRecords: {},
    };

    if (ens?.resolver?.texts) {
      await fetchAllEnsTextRecords(domain, ens.resolver.texts).then(
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
    return {
      ownerId: null,
      address: null,
      expiryDate: null,
      parentName: null,
      coinTypes: null,
      textRecords: {},
    };
  }
}

export function formatHexAddress(hexAddress: string): string {
  const startLength = 6;
  const endLength = 10;

  if (!hexAddress) {
    return "";
  }

  // Validate input
  if (isAddress(hexAddress)) {
    throw new Error("Invalid Ethereum address");
  }

  // Extract parts of the address
  const start = hexAddress.slice(2, startLength + 2);
  const end = hexAddress.slice(-endLength);

  // Return the formatted address
  return `0x${start}...${end}`;
}

export const formatDate = ({ unixTimestamp }: { unixTimestamp: number }) => {
  const date = moment.unix(unixTimestamp);
  const formattedDate = date.format("D MMMM, YYYY");
  return formattedDate;
};
