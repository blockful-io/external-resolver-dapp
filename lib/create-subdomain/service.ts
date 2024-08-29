import { Address, toHex } from "viem";
import { getRevertErrorData, handleDBStorage } from "../utils/blockchain-txs";
import { DomainData, MessageData } from "../utils/types";
import { publicClient } from "../wallet/wallet-config";
import DomainResolverABI from "../abi/resolver.json";
import toast from "react-hot-toast";

interface CreateSubdomainArgs {
  resolverAddress: Address;
  signerAddress: Address;
  name: string;
}

export const createSubdomain = async ({
  resolverAddress,
  signerAddress,
  name,
}: CreateSubdomainArgs) => {
  try {
    const dnsName = toHex(name),
          ttl = 300,
          owner = signerAddress
    await publicClient.simulateContract({
      functionName: "register",
      abi: DomainResolverABI,
      args: [dnsName, ttl, owner],
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
