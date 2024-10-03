import {
  Address,
  Chain,
  createWalletClient,
  custom,
  defineChain,
  encodeFunctionData,
  fromBytes,
  Hash,
  Hex,
  namehash,
  publicActions,
  PublicClient,
  toHex,
} from "viem";
import { getRevertErrorData, handleDBStorage } from "../utils/blockchain-txs";
import { DomainData, MessageData } from "../utils/types";
import DomainResolverABI from "../abi/resolver.json";
import L1ResolverABI from "../abi/arbitrum-resolver.json";
import toast from "react-hot-toast";
import { getCoderByCoinName } from "@ensdomains/address-encoder";
import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";
import * as chains from "viem/chains";

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
      abi: DomainResolverABI,
      args: [namehash(name), "url", website],
    });

    calls.push(websiteCallData);
  }

  if (description) {
    const descriptionCallData = encodeFunctionData({
      functionName: "setText",
      abi: DomainResolverABI,
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
      abi: DomainResolverABI,
      args: [namehash(name), 60, addressEncoded],
    });

    calls.push(addressCallData);
  }

  const dnsName = toHex(name),
    owner = signerAddress;

  let calldata;
  try {
    //L2 Resolver
    // if the function registerParams exists, it's an l2 resolver, no error will be thrown
    const ttl = 31556952000n;
    const [value] = (await client.readContract({
      address: resolverAddress,
      abi: L1ResolverABI,
      args: [dnsName, ttl],
      functionName: "registerParams",
    })) as [bigint, bigint, Hex];

    const l2Calldata = {
      functionName: "register",
      abi: L1ResolverABI,
      args: [
        extractLabelFromName(name),
        signerAddress, // owner
        ttl,
        `0x${"a".repeat(64)}` as Hex, // secret
        "0xD9555FC98250d60974cf50cbf42Ffff361fE352e", // L2 resolver
        calls, // calldata
        false, // primaryName
        0, // fuses
        `0x${"a".repeat(64)}` as Hex,
      ],

      address: resolverAddress,
      account: signerAddress,
      value, // price
    };
    calldata = l2Calldata;
  } catch (error) {
    // Offchain Resolver
    const ttl = 300;
    const offChainCalldata = {
      functionName: "register",
      abi: DomainResolverABI,
      args: [dnsName, ttl, owner, calls],
      account: signerAddress,
      address: resolverAddress,
    };
    console.error(error);

    calldata = offChainCalldata;
  }

  try {
    await client.simulateContract(calldata);
  } catch (error) {
    const data = getRevertErrorData(error);
    if (data?.errorName === "StorageHandledByOffChainDatabase") {
      const [domain, url, message] = data.args as [
        DomainData,
        string,
        MessageData
      ];

      const response = await handleDBStorage({
        domain,
        url,
        message,
        authenticatedAddress: signerAddress,
        chain: chain,
      });

      return response;
    } else if (data?.errorName === "StorageHandledByL2") {
      const [chainId, contractAddress] = data.args as [bigint, `0x${string}`];

      const selectedChain = getChain(Number(chainId));

      if (!selectedChain) {
        toast.error("error");
        return;
      }

      const clientWithWallet = createWalletClient({
        chain: selectedChain,
        transport: custom(window.ethereum),
      }).extend(publicActions);

      await clientWithWallet.addChain({ chain: selectedChain });

      const { request } = await clientWithWallet.simulateContract({
        ...calldata,
        address: contractAddress,
      });

      await clientWithWallet.writeContract(request);

      await clientWithWallet.switchChain({ id: chains.sepolia.id });

      return { ok: true };
    } else {
      toast.error("error");
      console.error("writing failed: ", { error });
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
