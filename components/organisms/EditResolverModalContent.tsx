import { walletWagmiConfig } from "@/lib/wallet/wallet-config";
import { setResolver } from "@ensdomains/ensjs/wallet";
import { Button, Input } from "@ensdomains/thorin";
import { useState } from "react";
import toast from "react-hot-toast";
import { Address, isAddress } from "viem";
import { useWalletClient } from "wagmi";

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
  const [isLoading, setIsloading] = useState(false);
  const { data: walletClient } = useWalletClient({ config: walletWagmiConfig });

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
    <div className="w-[480px] overflow-hidden rounded-xl border">
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
