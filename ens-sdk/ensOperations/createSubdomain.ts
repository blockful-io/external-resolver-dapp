import {
  Address,
  Chain,
  createWalletClient,
  custom,
  encodeFunctionData,
  fromBytes,
  Hash,
  Hex,
  keccak256,
  namehash,
  publicActions,
  stringToHex,
  toHex,
} from "viem";
import { EnsPublicClient, storeDataInDb } from "@/ens-sdk";
import { DomainData, MessageData } from "@/lib/utils/types";
import L1ResolverABI from "../../lib/abi/arbitrum-resolver.json";
import toast from "react-hot-toast";
import { getCoderByCoinName } from "@ensdomains/address-encoder";
import * as chains from "viem/chains";
import { packetToBytes } from "viem/ens";
import { SECONDS_PER_YEAR } from "@namehash/ens-utils";
import { getNameRegistrationSecret } from "../../lib/name-registration/localStorage";
import { DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES } from "../../lib/name-registration/constants";
import { getChain } from "../utils";
import { getRevertErrorData } from "../utils/getRevertErrorData";

interface CreateSubdomainArgs {
  resolverAddress: Address;
  signerAddress: Address;
  name: string;
  address: string;
  website: string;
  description: string;
  client: EnsPublicClient;
  chain: Chain;
}

/**
 * Creates a subdomain with associated records (website, description, and address) for an ENS name.
 * This function is specifically designed to handle offchain and L2 domains.
 *
 * The function performs the following steps:
 * 1. Prepares call data for setting text records (website and description) if provided.
 * 2. Prepares call data for setting the address record if provided.
 * 3. Calculates the registration fee and retrieves necessary parameters from the resolver contract.
 * 4. Attempts to simulate the contract call for subdomain creation.
 * 5. Handles two specific scenarios based on the simulation result:
 *    - If storage is handled by an off-chain database, it processes the request accordingly.
 *    - If storage is handled by an L2 network, it switches to the appropriate network,
 *      performs the transaction, and switches back to the original network.
 *
 * Note: This function does not support standard L1 ENS registrations. It is specifically
 * tailored for offchain storage solutions and L2 network integrations.
 */
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
      dnsName, // name
      signerAddress, // owner
      SECONDS_PER_YEAR.seconds,
      getNameRegistrationSecret(), // secret
      calldataResolver, // L2
      calls, // records calldata
      false, // reverseRecord
      DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES, // fuses
      `0x${"a".repeat(64)}` as Hex, // extraData
    ],
    address: resolverAddress, // L1
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
        MessageData,
      ];

      const response = await storeDataInDb({
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
      toast.error("Unsupported domain type");
      console.error("writing failed: ", { error });
    }
  }
};
