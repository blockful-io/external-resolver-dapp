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
    await publicClient.simulateContract({
      functionName: "register",
      abi: DomainResolverABI,
      args: [toHex(name), 300, signerAddress],
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

      if (response?.ok) {
        toast.success("Subdomain created successfully 🙂");
      }
    } else {
      toast.error("erro");
      console.error("writing failed: ", { error });
    }
  }
};
