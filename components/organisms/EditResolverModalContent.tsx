import { walletWagmiConfig } from "@/lib/wallet/wallet-config";
import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";
import { setResolver } from "@ensdomains/ensjs/wallet";
import { Button, Input } from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Address, isAddress, PublicClient } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { getSupportedInterfaces } from "@ensdomains/ensjs/public";

interface EditResolverModalContentProps {
  name: string;
  currentResolverAddress: Address;
  onCloseModal: () => void;
  onRecordsEdited?: () => void;
}

const checkResolverCompatibility = async (
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

export const EditResolverModalContent = ({
  currentResolverAddress,
  onCloseModal,
  name,
}: EditResolverModalContentProps) => {
  const [resolverAddress, setResolverAddress] = useState<string>(
    currentResolverAddress
  );
  const [transactionHash, setTransactionHash] = useState<Address | undefined>();
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [unsupportedInterfaces, setUnsupportedInterfaces] = useState<string[]>(
    []
  );
  const [isLoading, setIsloading] = useState(false);
  const { data: walletClient } = useWalletClient({ config: walletWagmiConfig });
  const publicClient = usePublicClient() as PublicClient & ClientWithEns;

  useEffect(() => {
    (async () => {
      const invalidInterfaces = await checkResolverCompatibility(
        publicClient,
        resolverAddress
      );
      setUnsupportedInterfaces(invalidInterfaces);
    })();
  }, [resolverAddress]);

  const handleSaveAction = async () => {
    if (!walletClient) {
      toast.error("No wallet client found. Please contact our team.");
      return;
    }

    const [address] = await walletClient.getAddresses();

    if (isAddress(resolverAddress)) {
      setIsloading(true);
      try {
        const hash =
          address &&
          (await setResolver(walletClient, {
            name: name,
            contract: "nameWrapper",
            resolverAddress: resolverAddress,
            account: address,
          }));
        setTransactionHash(hash);
        setTransactionSuccess(true);
      } catch {
        () => {
          toast.error("An error occured, please try again later...");
        };
      }
      setIsloading(false);
    } else {
      toast.error("Your resolver must be an address");
    }
  };

  return (
    <div className="w-[480px] border rounded-xl overflow-hidden">
      <div className="py-5 px-6 flex justify-between w-full bg-gray-50 border-b font-semibold text-black">
        Edit Resolver
      </div>
      <div className="bg-white text-black border-b border-gray-200 p-6 flex flex-col gap-4">
        {transactionSuccess ? (
          <>
            <p className="text-7xl"> 🎉</p>
            <div>
              <p className="text-lg">
                <span className="font-bold">Congratulations!</span>
              </p>
              <p>Update resolver transaction sent</p>
            </div>

            <p className="text-sm">
              Check your transaction:{" "}
              <a
                className="text-gray-500 underline hover:text-gray-700 transition-colors duration-200"
                target="_blank"
                // TODO: Adjust links once mainnet is supported
                href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
              >
                https://sepolia.etherscan.io/tx/...
              </a>
            </p>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {unsupportedInterfaces.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4 flex items-start">
                <div className="flex-shrink-0 w-6 h-6 mr-3 mt-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-full h-full text-yellow-600"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-yellow-600 text-sm font-medium">
                    The following interfaces are not supported by the resolver:
                  </p>
                  <p className="text-yellow-800 text-sm mt-1">
                    {unsupportedInterfaces.join(", ")}
                  </p>
                </div>
              </div>
            )}

            <Input
              clearable
              label={"Resolver Address"}
              placeholder={"0x00"}
              type="text"
              value={resolverAddress}
              onChange={(e) => setResolverAddress(e.target.value)}
              error={
                resolverAddress.length &&
                !isAddress(resolverAddress) &&
                "invalid address"
              }
            />
          </div>
        )}

        {isLoading && <h1>Check your wallet</h1>}
      </div>

      <div className="py-5 px-6 flex justify-end w-full bg-white gap-4">
        {transactionSuccess ? (
          <>
            <div>
              <Button onClick={onCloseModal}>Done</Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <Button colorStyle="greySecondary" onClick={onCloseModal}>
                Cancel
              </Button>
            </div>
            <div>
              <Button
                disabled={
                  !isAddress(resolverAddress) ||
                  resolverAddress === currentResolverAddress
                }
                onClick={handleSaveAction}
              >
                Save
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
