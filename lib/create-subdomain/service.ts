import {
  Address,
  Chain,
  createPublicClient,
  custom,
  decodeErrorResult,
  defineChain,
  encodeFunctionData,
  getChainContractAddress,
  Hex,
  namehash,
  PublicClient,
  toHex,
  walletActions,
  zeroHash,
} from "viem";
import { getRevertErrorData, handleDBStorage } from "../utils/blockchain-txs";
import { DomainData, MessageData } from "../utils/types";
import L1ResolverABI from "../abi/arbitrum-resolver.json";
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

// A new interface for the args required in the universal resolver call helper.
interface ExecuteUniversalResolverCallArgs {
  client: PublicClient & ClientWithEns;
  universalResolverContractAddress: Address;
  dnsName: Hex;
  calldata: {
    functionName: string;
    abi: any; // Replace with a proper ABI type if available.
    args: any[];
  };
  chain: Chain;
  signerAddress: Address;
  encodeFunctionData: typeof encodeFunctionData;
}

/**
 * Executes the universal resolver contract call and handles both offchain and onchain operations.
 * Receives an encodeFunctionData function as an argument.
 */
export async function executeUniversalResolverCall({
  client,
  universalResolverContractAddress,
  dnsName,
  calldata, //-> hex (da enconded date antes)
  chain,
  signerAddress,
  encodeFunctionData,
}: ExecuteUniversalResolverCallArgs): Promise<{ ok: boolean } | void> {
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
          args: [encodeFunctionData(calldata)],
        }),
      ],
    });
  } catch (error) {
    const data = getRevertErrorData(error);
    if (!data || !data.args || data.args.length === 0) {
      console.log({ error });
      return;
    }

    const [params] = data.args;
    const errorResult = decodeErrorResult({
      abi: L1ResolverABI,
      data: params as Hex,
    });

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

        const chainIdNumber = Number(chainId);

        // Add chain to wallet before switching
        try {
          await l2Client.addChain({
            chain: getChain(chainIdNumber),
          });
        } catch (err) {
          console.error("Failed to add chain:", err);
        }

        // Switch chain using the wallet client
        await l2Client.switchChain({ id: chainIdNumber });

        // SUBDOMAIN PRICING
        let value = 0n;
        if (calldata.functionName === "register") {
          const registerParams = (await l2Client.readContract({
            address: contractAddress,
            abi: L1ResolverABI,
            functionName: "registerParams",
            args: [dnsName, SECONDS_PER_YEAR.seconds],
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
        }

        try {
          const { request } = await l2Client.simulateContract({
            ...calldata,
            address: contractAddress,
            account: signerAddress,
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
  const dnsName = toHex(packetToBytes(name));

  const calldataRegister = {
    functionName: "register",
    abi: L1ResolverABI,
    args: [
      {
        name: dnsName,
        owner: signerAddress,
        duration: SECONDS_PER_YEAR.seconds * BigInt(1000),
        secret: zeroHash,
        resolver: "0x0a33f065c9c8f0F5c56BB84b1593631725F0f3af",
        extraData: zeroHash,
      },
    ],
    address: resolverAddress, // L1
    account: signerAddress,
  };

  const universalResolverContractAddress = getChainContractAddress({
    chain: client.chain,
    contract: "ensUniversalResolver",
  });

  // Now we delegate the universal resolver contract call to our new helper.
  const result = await executeUniversalResolverCall({
    client,
    universalResolverContractAddress,
    dnsName,
    calldata: calldataRegister,
    chain,
    signerAddress,
    encodeFunctionData, // passed as an argument so the helper may encode its parameters
  });

  // TODO - Set domain records

  return result;
};

export function getChain(chainId: number): Chain {
  const chain = [
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

  if (!chain) {
    throw new Error(`Chain with id ${chainId} not found`);
  }

  return chain;
}
