import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";
import { getSupportedInterfaces } from "@ensdomains/ensjs/public";
import { Address, isAddress, PublicClient } from "viem";

export const getUnsupportedResolverInterfaces = async (
  publicClient: PublicClient & ClientWithEns,
  resolverAddress: string
): Promise<string[]> => {
  if (!isAddress(resolverAddress)) {
    return [];
  }

  const requiredInterfaces: { id: Address; name: string }[] = [
    { id: "0x3b3b57de", name: "ENSIP-1 / EIP-137 (read eth address)" },
    { id: "0xf1cb7e06", name: "ENSIP-9 / EIP-2304 (read multicoin address)" },
    { id: "0xbc1c58d1", name: "ENSIP-7 / EIP-1577 (read contenthash)" },
    { id: "0x59d1d43c", name: "ENSIP-5 / EIP-634 (read text record)" },
    // { id: "0xf92709e0", name: "OffchainRegister" },
    // { id: "0x8de0a2ed", name: "OffchainRegisterParams" },
    // { id: "0xac9650d8", name: "OffchainMulticallable" },
  ];

  const supportedInterfacesResult = await getSupportedInterfaces(publicClient, {
    address: resolverAddress,
    interfaces: requiredInterfaces.map(
      (resolverInterface) => resolverInterface.id
    ),
  });

  const missingInterfaces = requiredInterfaces
    .filter((_, index) => !supportedInterfacesResult[index])
    .map((resolverInterface) => resolverInterface.name);

  return missingInterfaces;
};
