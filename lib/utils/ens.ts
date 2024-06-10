import assert from "assert";
import { publicClient } from "../wallet/wallet-config";
import { normalize } from "viem/ens";
import moment from "moment";

const ENS_ENDPOINT = "https://api.thegraph.com/subgraphs/name/ensdomains/ens";

export interface ResolvedEnsData {
  ownerId: `0x${string}`;
  address: `0x${string}`;
  parentName: string;
  expiryDate: string;
  coinTypes: string[];
  textRecords: ENSRecords;
}

const ENS_QUERY = `
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
      query: ENS_QUERY,
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

export async function getENS(_domain: string): Promise<any> {
  if (!(ADDRESS_REGEX.test(_domain) || _domain?.endsWith(".eth")))
    throw new Error(`Invalid ENS domain or ethereum address: ${_domain}`);
  const domain = _domain;

  const ens = await fetchEnsDataRequest(domain);

  if (ens) {
    let returnedData: ResolvedEnsData = {
      ownerId: ens.owner.id,
      address: ens.resolvedAddress.id,
      expiryDate: ens.expiryDate,
      parentName: ens.parent.name,
      coinTypes: ens.resolver.coinTypes,
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
      owner: null,
      address: null,
      records: {},
      domain: null,
      coins: {},
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
  if (!hexAddress || !hexAddress.startsWith("0x") || hexAddress.length !== 42) {
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
