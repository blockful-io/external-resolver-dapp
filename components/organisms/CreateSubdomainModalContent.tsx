import { createSubdomain } from "@/lib/create-subdomain/service";
import { Button, Input } from "@ensdomains/thorin";
import { useState } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";

interface CreateSubdomainModalContentProps {
  name: string;
  currentResolverAddress: Address;
  onCloseModal: () => void;
  onRecordsEdited?: () => void;
}

export const CreateSubdomainModalContent = ({
  currentResolverAddress,
  onCloseModal,
  name,
}: CreateSubdomainModalContentProps) => {
  const [newSubdomain, setNewSubdomain] = useState<string>("");
  // const [transactionHash, setTransactionHash] = useState<Address | undefined>();
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  const authedUser = useAccount();

  const handleSaveAction = async () => {
    setIsloading(true);
    await createSubdomain({
      resolverAddress: currentResolverAddress,
      signerAddress: authedUser.address!,
      name: `${newSubdomain}.${name}`,
    });
    setIsloading(false);
  };

  return (
    <div className="w-[480px] border rounded-xl overflow-hidden">
      <div className="py-5 px-6 flex justify-between w-full bg-gray-50 border-b font-semibold text-black">
        New subdomain
      </div>
      <div className="bg-white text-black border-b border-gray-200 p-6 flex flex-col gap-4">
        {transactionSuccess ? (
          <>
            <p className="text-7xl"> 🎉</p>
            <div>
              <p className="text-lg">
                <span className="font-bold">Congratulations!</span>
              </p>
              <p>New subdomain created!</p>
            </div>
          </>
        ) : (
          <Input
            clearable
            label={"subdomain"}
            placeholder={""}
            type="text"
            value={newSubdomain}
            onChange={(e) => setNewSubdomain(e.target.value)}
            suffix={`.${name}`}
            // error={"invalid address"}
          />
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
              <Button disabled={isLoading} onClick={handleSaveAction}>
                Save
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
