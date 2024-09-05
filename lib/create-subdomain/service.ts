import {
  Address,
  encodeFunctionData,
  fromBytes,
  Hash,
  namehash,
  toHex,
} from "viem";
import { getRevertErrorData, handleDBStorage } from "../utils/blockchain-txs";
import { DomainData, MessageData } from "../utils/types";
import { publicClient } from "../wallet/wallet-config";
import DomainResolverABI from "../abi/resolver.json";
import toast from "react-hot-toast";
import { getCoderByCoinName } from "@ensdomains/address-encoder";

interface CreateSubdomainArgs {
  resolverAddress: Address;
  signerAddress: Address;
  name: string;
  address: string;
  website: string;
  description: string;
}

// TO-DO: Fix function later to accept more text / address params
export const createSubdomain = async ({
  resolverAddress,
  signerAddress,
  name,
  address,
  website,
  description,
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

  try {
    const dnsName = toHex(name),
      ttl = 300,
      owner = signerAddress;
    await publicClient.simulateContract({
      functionName: "register",
      abi: DomainResolverABI,
      args: [dnsName, ttl, owner, calls],
      account: signerAddress,
      address: resolverAddress,
    });
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
      });

      return response;
    } else {
      toast.error("error");
      console.error("writing failed: ", { error });
    }
  }
};
