import L1ResolverABI from "../../lib/abi/arbitrum-resolver.json";

import {
  namehash,
  publicActions,
  type WalletClient,
  encodeFunctionData,
  createWalletClient,
  custom,
  Hash,
  fromBytes,
  Address,
  PublicClient,
  Chain,
  stringToHex,
} from "viem";
import { ENSName } from "@namehash/ens-utils";
import { getBlockchainTransactionError } from "../../lib/wallet/txError";

import DomainResolverABI from "../../lib/abi/offchain-resolver.json";
import { normalize } from "viem/ens";
import { supportedCoinTypes } from "../../lib/domain-page";
import {
  coinNameToTypeMap,
  getCoderByCoinName,
} from "@ensdomains/address-encoder";
import { DomainData, MessageData } from "../../lib/utils/types";
import toast from "react-hot-toast";
import { sepolia } from "viem/chains";
import { getChain } from "../utils";
import { getRevertErrorData } from "../utils/getRevertErrorData";
import { storeDataInDb } from "./storeDataInDb";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
}

/*
  3rd step of a name registration - set text records
*/

interface SetDomainRecordsParams {
  ensName: ENSName;
  resolverAddress?: Address;
  domainResolverAddress?: `0x${string}`;
  authenticatedAddress: Address;
  textRecords: Record<string, string>;
  addresses: Record<string, string>;
  others: Record<string, string>;
  client: PublicClient & WalletClient;
  chain: Chain;
}

/**
 * Sets various records for an ENS domain
 *
 * This function allows setting text records, addresses, and other records for an ENS domain.
 * It can handle both on-chain and off-chain storage depending on the resolver configuration.
 *
 * @param {SetDomainRecordsParams} params - The parameters for setting domain records
 * @returns {Promise<number | TransactionErrorType>} - A status code or an error
 */
export const setDomainRecords = async ({
  ensName,
  resolverAddress,
  domainResolverAddress,
  authenticatedAddress,
  textRecords,
  addresses,
  others,
  client,
  chain,
}: SetDomainRecordsParams) => {
  try {
    const publicAddress = normalize(ensName.name);

    // Prepare calls for setting various records
    const calls: Hash[] = [];

    // Add calls for text records
    for (let i = 0; i < Object.keys(textRecords).length; i++) {
      const key = Object.keys(textRecords)[i];
      const value = textRecords[key];

      if (value !== null && value !== undefined) {
        const callData = encodeFunctionData({
          functionName: "setText",
          abi: DomainResolverABI,
          args: [namehash(publicAddress), key, value],
        });

        calls.push(callData);
      }
    }

    // Add calls for address records
    for (let i = 0; i < Object.keys(addresses).length; i++) {
      const [cryptocurrencyName, address] = Object.entries(addresses)[i];
      if (supportedCoinTypes.includes(cryptocurrencyName.toUpperCase())) {
        console.error(`cryptocurrency ${cryptocurrencyName} not supported`);
        continue;
      }

      const coinType =
        coinNameToTypeMap[cryptocurrencyName as keyof typeof coinNameToTypeMap];

      const coder = getCoderByCoinName(cryptocurrencyName.toLocaleLowerCase());
      const addressEncoded = fromBytes(coder.decode(address), "hex");
      const callData = encodeFunctionData({
        functionName: "setAddr",
        abi: DomainResolverABI,
        args: [namehash(publicAddress), BigInt(coinType), addressEncoded],
      });
      calls.push(callData);
    }

    // Add calls for other records (e.g., contenthash)
    for (let i = 0; i < Object.keys(others).length; i++) {
      const [key, value] = Object.entries(others)[i];
      const callData = encodeFunctionData({
        functionName: "setContenthash",
        abi: L1ResolverABI,
        args: [namehash(publicAddress), stringToHex(value)], // value = url
      });
      calls.push(callData);
    }

    try {
      let localResolverAddress;

      if (resolverAddress) {
        localResolverAddress = resolverAddress;
      } else if (domainResolverAddress) {
        localResolverAddress = domainResolverAddress;
      } else {
        throw new Error("No domain resolver informed");
      }

      // Simulate the multicall contract interaction
      await client.simulateContract({
        functionName: "multicall",
        abi: L1ResolverABI,
        args: [calls],
        account: authenticatedAddress,
        address: localResolverAddress,
      });
    } catch (error) {
      const data = getRevertErrorData(error);
      if (data?.errorName === "StorageHandledByOffChainDatabase") {
        // Handle off-chain storage
        const [domain, url, message] = data.args as [
          DomainData,
          string,
          MessageData,
        ];

        try {
          await storeDataInDb({
            domain,
            url,
            message,
            authenticatedAddress,
            chain: chain,
          });

          return 200;
        } catch (error) {
          console.error("writing failed: ", { error });
          const errorType = getBlockchainTransactionError(error);
          return errorType;
        }
      } else if (data?.errorName === "StorageHandledByL2") {
        // Handle L2 storage
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
            functionName: "multicall",
            abi: L1ResolverABI,
            args: [calls],
            account: authenticatedAddress,
            address: contractAddress,
          });
          await clientWithWallet.writeContract(request);
        } catch {
          await clientWithWallet.switchChain({ id: sepolia.id });
        }

        await clientWithWallet.switchChain({ id: sepolia.id });

        return 200;
      } else {
        console.error("writing failed: ", { error });
        const errorType = getBlockchainTransactionError(error);
        return errorType;
      }
    }
  } catch (error: unknown) {
    console.error(error);
    const errorType = getBlockchainTransactionError(error);
    return errorType;
  }
};
