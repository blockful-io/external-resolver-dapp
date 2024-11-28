import ETHRegistrarABI from "@/lib/abi/eth-registrar.json";
import { nameRegistrationSmartContracts } from "../../lib/name-registration/constants";
import { SupportedNetwork } from "../../lib/wallet/chains";
import { ENSName, SECONDS_PER_YEAR } from "@namehash/ens-utils";

import { EnsPublicClient, NamePrice } from "../types";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
}

interface GetNamePriceParams {
  ensName: ENSName;
  durationInYears: bigint;
  publicClient: EnsPublicClient;
}

export const getNamePrice = async ({
  ensName,
  durationInYears,
  publicClient,
}: GetNamePriceParams): Promise<bigint> => {
  const ensNameDirectSubname = ensName.name.split(".eth")[0];

  const chain = publicClient.chain;

  if (!Object.values(SupportedNetwork).includes(chain.id)) {
    throw new Error(`Unsupported network: ${chain.id}`);
  }

  const nameRegistrationContracts =
    nameRegistrationSmartContracts[chain.id as SupportedNetwork];

  const price = await publicClient.readContract({
    args: [ensNameDirectSubname, durationInYears * SECONDS_PER_YEAR.seconds],
    address: nameRegistrationContracts.ETH_REGISTRAR,
    functionName: "rentPrice",
    abi: ETHRegistrarABI,
  });
  if (price) {
    return (price as NamePrice).base + (price as NamePrice).premium;
  } else {
    throw new Error("Error getting name price");
  }
};
