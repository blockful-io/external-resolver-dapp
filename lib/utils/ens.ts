import assert from "assert";
import { publicClient } from "../wallet/wallet-config";
import { normalize } from "viem/ens";
import moment from "moment";

const ENDPOINT = "https://api.thegraph.com/subgraphs/name/ensdomains/ens";

export interface ResolvedEnsData {
  ownerId: `0x${string}`;
  address: `0x${string}`;
  parentName: string;
  expiryDate: string;
  coinTypes: string[];
  textRecords: ENSRecords;
}

const QUERY = `
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

const request = async (
  endpoint: string,
  query: string,
  variables: Record<string, any>,
  fetchOptions: RequestInit = {}
) => {
  const res = await fetch(endpoint, {
    ...fetchOptions,
    body: JSON.stringify({ query, variables }),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  assert.strictEqual(200, res.status);

  const json = await res.json();

  console.log("JSON ", json);

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
      const ensText = await publicClient.getEnsText({
        name: normalize(domain),
        key,
      });

      records[key] = ensText ?? "No record found";
    } catch (error) {
      console.error(`Error fetching text record for key ${key}:`, error);
      records[key] = "Error fetching record";
    }
  });

  await Promise.all(promises);

  return records;
};

export const getENSData = (opts?: Partial<{ endpointUrl: string }>) => {
  const endpointUrl = opts?.endpointUrl || ENDPOINT;

  return async function getENS(
    _domain: string,
    fetchOptions?: RequestInit
  ): Promise<any> {
    if (!(ADDRESS_REGEX.test(_domain) || _domain?.endsWith(".eth")))
      throw new Error(`Invalid ENS domain or ethereum address: ${_domain}`);
    const domain = _domain;

    const ens = await request(endpointUrl, QUERY, { domain }, fetchOptions);

    if (ens) {
      const records = await fetchAllEnsTextRecords(
        domain,
        ens.resolver.texts
      ).then((records) => {
        console.log("ENS Text Records:", records);

        const returnedData: ResolvedEnsData = {
          ownerId: ens.owner.id,
          address: ens.resolvedAddress.id,
          expiryDate: ens.expiryDate,
          parentName: ens.parent.name,
          coinTypes: ens.resolver.coinTypes,
          textRecords: records,
        };

        return returnedData;
      });

      return records;
    } else {
      return {
        owner: null,
        address: null,
        records: {},
        domain: null,
        coins: {},
      };
    }
  };
};

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
