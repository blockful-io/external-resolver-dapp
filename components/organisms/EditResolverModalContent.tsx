import { walletWagmiConfig } from "@/lib/wallet/wallet-config";
import {
  ClientWithEns,
  ClientWithAccount,
} from "ensjs-monorepo/packages/ensjs/dist/types/contracts/consts";
import { setResolver } from "ensjs-monorepo/packages/ensjs/dist/esm/wallet";
import { Button, Input } from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Address, isAddress, PublicClient } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { getUnsupportedResolverInterfaces } from "@/lib/utils/resolverHelpers";

interface EditResolverModalContentProps {
  name: string;
  currentResolverAddress: Address;
  onCloseModal: () => void;
  onRecordsEdited?: () => void;
}

export const EditResolverModalContent = ({
  currentResolverAddress,
  onCloseModal,
  name,
}: EditResolverModalContentProps) => {
  const [resolverAddress, setResolverAddress] = useState<string>(
    currentResolverAddress,
  );
  const [transactionHash, setTransactionHash] = useState<Address | undefined>();
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [unsupportedInterfaces, setUnsupportedInterfaces] = useState<string[]>(
    [],
  );
  const [isLoading, setIsloading] = useState(false);
  const { data: walletClient } = useWalletClient({ config: walletWagmiConfig });
  const publicClient = usePublicClient() as PublicClient & ClientWithEns;

  useEffect(() => {
    (async () => {
      const invalidInterfaces = await getUnsupportedResolverInterfaces(
        publicClient,
        resolverAddress,
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
          (await setResolver(walletClient as ClientWithAccount, {
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
    <div className="w-[580px] overflow-hidden rounded-xl border">
      <div className="flex w-full justify-between border-b bg-gray-50 px-6 py-5 font-semibold text-black">
        Edit Resolver
      </div>
      <div className="flex flex-col gap-4 border-b border-gray-200 bg-white p-6 text-black">
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
                className="text-gray-500 underline transition-colors duration-200 hover:text-gray-700"
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
              <div className="mb-4 flex items-center rounded-xl border border-amber-400 bg-amber-100 p-4">
                <div className="ml-2 mr-5 h-10 w-10 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-full w-full text-yellow-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <ul className="text-base font-medium text-gray-800">
                    {unsupportedInterfaces.map((interfaceItem, index) => (
                      <li key={index}>
                        - Address does not support {interfaceItem} interface
                      </li>
                    ))}
                  </ul>
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

      <div className="flex w-full justify-end gap-4 bg-white px-6 py-5">
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
