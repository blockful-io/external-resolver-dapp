import assert from "assert";
import { publicClient } from "../wallet/wallet-config";
import { normalize, packetToBytes } from "viem/ens";
import moment from "moment";
import {
  Address,
  BaseError,
  Hash,
  Hex,
  PrivateKeyAccount,
  RawContractError,
  encodeFunctionData,
  getChainContractAddress,
  isAddress,
  namehash,
  toHex,
} from "viem";

import { abi as dbAbi } from "./DatabaseResolver.json";
import { abi as uAbi } from "./UniversalResolver.json";
import { sepolia } from "viem/chains";

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

// export async function handleDBStorage({
//   domain,
//   url,
//   message,
//   signer,
// }: {
//   // need help with those 2
//   domain: DomainData;
//   url: string;
//   message: MessageData;
//   signer: PrivateKeyAccount;
// }) {
//   const signature = await signer.signTypedData({
//     domain,
//     message,
//     types: {
//       Message: [
//         { name: "functionSelector", type: "bytes4" },
//         { name: "sender", type: "address" },
//         { name: "parameters", type: "Parameter[]" },
//         { name: "expirationTimestamp", type: "uint256" },
//       ],
//       Parameter: [
//         { name: "name", type: "string" },
//         { name: "value", type: "string" },
//       ],
//     },
//     primaryType: "Message",
//   });

//   const callData = encodeFunctionData({
//     abi: dbAbi,
//     functionName: message.functionSelector,
//     args: message.parameters.map((arg) => arg.value),
//   });
//   await ccipRequest({
//     body: {
//       data: callData,
//       signature: { message, domain, signature },
//       sender: message.sender,
//     },
//     url,
//   });
// }

// export type CcipRequestParameters = {
//   body: { data: Hex; signature: TypedSignature; sender: Address };
//   url: string;
// };

// export async function ccipRequest({
//   body,
//   url,
// }: CcipRequestParameters): Promise<Response> {
//   return await fetch(url.replace("/{sender}/{data}.json", ""), {
//     body: JSON.stringify(body, (_, value) =>
//       typeof value === "bigint" ? value.toString() : value
//     ),
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });
// }

export const writeEnsData = async (authedUser: string, domain: string) => {
  const resolver = getChainContractAddress({
    chain: sepolia,
    contract: "ensUniversalResolver",
  });

  const [resolverAddr] = (await publicClient.readContract({
    address: resolver,
    functionName: "findResolver",
    abi: uAbi,
    args: [toHex(packetToBytes("eduardo.eth"))],
  })) as Hash[];

  // REGISTER NEW DOMAIN
  try {
    await publicClient.simulateContract({
      functionName: "register",
      abi: dbAbi,
      args: [namehash("eduardo.eth"), 999999999n],
      account: authedUser as Hash,
      address: resolverAddr,
    });
  } catch (err) {
    console.log("error :", err);
    // const data = getRevertErrorData(err);
    // if (data?.errorName === "StorageHandledByOffChainDatabase") {
    //   const [domain, url, message] = data.args as [
    //     DomainData,
    //     string,
    //     MessageData
    //   ];
    //   await handleDBStorage({ domain, url, message, signer });
    // } else {
    //   console.error("writing failed: ", { err });
    // }
  }

  try {
    await publicClient.simulateContract({
      functionName: "setText",
      abi: dbAbi,
      args: [namehash("eduardo.eth"), "com.twitter", "@blockful.eth"],
      address: resolverAddr, // contract to call
      account: authedUser as Hash, // conta do usuário logado
    });
  } catch (err) {
    console.log("error :", err);
    // const data = getRevertErrorData(err)
    // if (data?.errorName === "StorageHandledByOffChainDatabase’) {
    //   const [domain, url, message] = data?.args as [
    //     DomainData,
    //     string,
    //     MessageData,
    //   ]
    //   await handleDBStorage({ domain, url, message, signer })
    // } else {
    //   console.error(‘writing failed: ’, { err })
    // }
  }
};

// export function getRevertErrorData(err: unknown) {
//   if (!(err instanceof BaseError)) return undefined;
//   const error = err.walk() as RawContractError;
//   return error?.data as { errorName: string; args: unknown[] };
// }

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

  console.log("records: ", records);

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

  console.log(hexAddress);
  // Validate input
  if (!isAddress(hexAddress)) {
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
