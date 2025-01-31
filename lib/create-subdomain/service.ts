import {
  Address,
  Chain,
  createPublicClient,
  custom,
  decodeErrorResult,
  defineChain,
  encodeFunctionData,
  fromBytes,
  getChainContractAddress,
  Hash,
  Hex,
  keccak256,
  namehash,
  PublicClient,
  stringToHex,
  toHex,
  walletActions,
  zeroHash,
} from "viem";
import { getRevertErrorData, handleDBStorage } from "../utils/blockchain-txs";
import { DomainData, MessageData } from "../utils/types";
import L1ResolverABI from "../abi/arbitrum-resolver.json";
import { getCoderByCoinName } from "@ensdomains/address-encoder";
import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";
import * as chains from "viem/chains";
import { packetToBytes } from "viem/ens";
import { SECONDS_PER_YEAR } from "@namehash/ens-utils";
import universalResolver from "../abi/universal-resolver.json";
import offchainResolver from "../abi/arbitrum-resolver.json";

interface CreateSubdomainArgs {
  resolverAddress: Address;
  signerAddress: Address;
  name: string;
  address: string;
  website: string;
  description: string;
  client: PublicClient & ClientWithEns;
  chain: Chain;
}

// TO-DO: Fix function later to accept more text / address params
export const createSubdomain = async ({
  resolverAddress,
  signerAddress,
  name,
  address,
  website,
  description,
  client,
  chain,
}: CreateSubdomainArgs) => {
  const calls: Hash[] = [];

  if (website) {
    const websiteCallData = encodeFunctionData({
      functionName: "setText",
      abi: L1ResolverABI,
      args: [namehash(name), "url", website],
    });

    calls.push(websiteCallData);
  }

  if (description) {
    const descriptionCallData = encodeFunctionData({
      functionName: "setText",
      abi: L1ResolverABI,
      args: [namehash(name), "description", description],
    });

    calls.push(descriptionCallData);
  }

  // set address
  if (address) {
    const coder = getCoderByCoinName("eth");
    const addressEncoded = fromBytes(coder.decode(address), "hex");

    const addressCallData = encodeFunctionData({
      functionName: "setAddr",
      abi: L1ResolverABI,
      args: [namehash(name), 60, addressEncoded],
    });

    calls.push(addressCallData);
  }

  const dnsName = toHex(packetToBytes(name));

  let value = 0n;

  let calldataResolver = resolverAddress;

  try {
    const [_value /* commitTime */ /* extraData */, ,] =
      (await client.readContract({
        address: resolverAddress,
        abi: L1ResolverABI,
        functionName: "registerParams",
        args: [toHex(name), SECONDS_PER_YEAR.seconds],
      })) as [bigint, bigint, Hex];
    value = _value;

    const l2ResolverAddress = (await client.readContract({
      address: resolverAddress,
      abi: L1ResolverABI,
      functionName: "targets",
      args: [keccak256(stringToHex("resolver"))],
    })) as Address;

    calldataResolver = l2ResolverAddress; // l2ResolverAddress
  } catch {
    // interface not implemented by the resolver
  }
  const calldata = {
    functionName: "register",
    abi: L1ResolverABI,
    args: [
      {
        name: dnsName,
        owner: signerAddress,
        duration: SECONDS_PER_YEAR.seconds * BigInt(1000),
        secret: zeroHash,
        extraData: zeroHash,
      },
    ],
    address: resolverAddress, // L1
    account: signerAddress,
    value: value,
  };

  const universalResolverContractAddress = getChainContractAddress({
    chain: client.chain,
    contract: "ensUniversalResolver",
  });

  try {
    await client.readContract({
      address: universalResolverContractAddress,
      abi: universalResolver,
      functionName: "resolve",
      args: [
        dnsName,
        encodeFunctionData({
          functionName: "getOperationHandler",
          abi: offchainResolver,
          args: [
            encodeFunctionData({
              functionName: "register",
              abi: offchainResolver,
              args: calldata.args,
            }),
          ],
        }),
      ],
    });
  } catch (error) {
    const data = getRevertErrorData(error);
    if (!data || !data.args || data.args?.length === 0) {
      console.log({ error });
      return;
    }

    const [params] = data.args;
    const errorResult = decodeErrorResult({
      abi: L1ResolverABI,
      data: params as Hex,
    });

    debugger;

    switch (errorResult?.errorName) {
      case "OperationHandledOffchain": {
        const [domain, url, message] = errorResult.args as [
          DomainData,
          string,
          MessageData,
        ];
        await handleDBStorage({
          domain,
          url,
          message,
          authenticatedAddress: signerAddress,
          chain,
        });

        return { ok: true };
      }
      case "OperationHandledOnchain": {
        const [chainId, contractAddress] = errorResult.args as [
          bigint,
          `0x${string}`,
        ];

        // Create a new client for L2 using window.ethereum
        const l2Client = createPublicClient({
          chain: getChain(Number(chainId)),
          transport: custom(window.ethereum),
        }).extend(walletActions);

        // Switch chain using the wallet client
        await l2Client.switchChain({ id: Number(chainId) });

        // SUBDOMAIN PRICING
        let value = 0n;
        if (calldata.functionName === "register") {
          const registerParams = (await l2Client.readContract({
            address: contractAddress,
            abi: L1ResolverABI,
            functionName: "registerParams",
            args: [dnsName, SECONDS_PER_YEAR.seconds * BigInt(1000)],
          })) as {
            price: bigint;
            commitTime: bigint;
            extraData: Hex;
            available: boolean;
            token: Hex;
          };
          value = registerParams.price;

          if (!registerParams.available) {
            console.log("Domain unavailable");
            return;
          }
          registerParams;
        }

        try {
          const { request } = await l2Client.simulateContract({
            ...calldata,
            address: contractAddress,
            value,
          });

          await l2Client.writeContract(request);

          return { ok: true };
        } catch (err) {
          console.log("error while trying to make the request: ", { err });
        } finally {
          await l2Client.switchChain({ id: chain.id });
        }
      }
      default:
        console.error("error registering domain: ", { error });
    }
  }
};

export function getChain(chainId: number) {
  return [
    ...Object.values(chains),
    defineChain({
      id: Number(chainId),
      name: "Arbitrum Local",
      nativeCurrency: {
        name: "Arbitrum Sepolia Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: [
            `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_TESTNET_KEY}`,
          ],
        },
      },
    }),
  ].find((chain) => chain.id === chainId);
}

// gather the first part of the domain (e.g. floripa.blockful.eth -> floripa, floripa.normal.blockful.eth -> floripa.normal)
const extractLabelFromName = (name: string): string => {
  const [, label] = /^(.+?)\.\w+\.\w+$/.exec(name) || [];
  return label;
};
