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
import { packetToBytes } from "viem/ens";
import { SECONDS_PER_YEAR } from "@namehash/ens-utils";
import { getNameRegistrationSecret } from "../name-registration/localStorage";
import { DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES } from "../name-registration/constants";

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

  const dnsName = toHex(packetToBytes(name));

  let value = 0n;

  try {
    const [_value /* commitTime */ /* extraData */, ,] =
      (await client.readContract({
        address: resolverAddress,
        abi: L1ResolverABI,
        functionName: "registerParams",
        args: [toHex(name), SECONDS_PER_YEAR.seconds],
      })) as [bigint, bigint, Hex];
    value = _value;
  } catch {
    // interface not implemented by the resolver
  }

  const calldata = {
    functionName: "register",
    abi: L1ResolverABI,
    args: [
      dnsName, // name
      signerAddress, // owner
      SECONDS_PER_YEAR.seconds,
      getNameRegistrationSecret(), // secret
      resolverAddress,
      calls, // records calldata
      false, // reverseRecord
      DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES, // fuses
      `0x${"a".repeat(64)}` as Hex, // extraData
    ],
    address: resolverAddress,
    account: signerAddress,
    value: value,
  };

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

      try {
        const { request } = await clientWithWallet.simulateContract({
          ...calldata,
          address: contractAddress,
        });

        await clientWithWallet.writeContract(request);
      } catch (error: any) {
        toast.error(error?.cause?.reason ?? "Error creating subdomain");
        /**
        *  Since our app does not support Arbitrum Sepolia in a lot of ways
        *  we want the user to be at this network for the least time possible,
        *  meaning that if the subdomains request above fails, we want him 
        *  to be back in a safe place before he starts to use the application
        *  functionalities once again, to guarantee a nice user experience.
        */
        await clientWithWallet.switchChain({ id: chains.sepolia.id });
        return { ok: false };
      }

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
