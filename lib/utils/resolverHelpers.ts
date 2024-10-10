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
    { id: "0x01ffc9a7", name: "ERC165" },
    { id: "0x3b3b57de", name: "addr(bytes32)" },
    { id: "0xf1cb7e06", name: "addr(bytes32,uint256)" },
    { id: "0x59d1d43c", name: "text(bytes32,string)" },
    { id: "0xbc1c58d1", name: "contenthash(bytes32)" },
    { id: "0x2203ab56", name: "ABI(bytes32,uint256)" },
    { id: "0xc8690233", name: "pubkey(bytes32)" },
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
