import { createSubdomain } from "@/lib/create-subdomain/service";
import { Button, Input, Spinner } from "@ensdomains/thorin";
import { buildENSName } from "@namehash/ens-utils";
import { normalize } from "viem/ens";
import { useState } from "react";
import toast from "react-hot-toast";
import { Address } from "viem";
import { useAccount } from "wagmi";

interface CreateSubdomainModalContentProps {
  name: string;
  currentResolverAddress: Address;
  onCloseModal: () => void;
  onRecordsEdited?: () => void;
  alreadyCreatedSubdomains?: string[];
}

export const CreateSubdomainModalContent = ({
  currentResolverAddress,
  onCloseModal,
  onRecordsEdited,
  name,
  alreadyCreatedSubdomains,
}: CreateSubdomainModalContentProps) => {
  const [newSubdomain, setNewSubdomain] = useState<string>("");
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  const authedUser = useAccount();

  const isSubdomainInvalid = () => {
    try {
      normalize(newSubdomain);
      buildENSName(newSubdomain);
      if (alreadyCreatedSubdomains?.includes(`${newSubdomain}.${name}`)) {
        return "Subdomain is already created";
      }
    } catch (error) {
      return "Invalid domain";
    }
  };

  const handleSaveAction = async () => {
    setIsloading(true);

    try {
      const response = await createSubdomain({
        resolverAddress: currentResolverAddress,
        signerAddress: authedUser.address!,
        name: `${newSubdomain}.${name}`,
      });
      if (response?.ok) {
        !!onRecordsEdited && onRecordsEdited();
        setTransactionSuccess(true);
        toast.success("Subdomain created successfully 🙂");
      }
    } catch (error) {
      console.log(error);
    }

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
            onChange={(e) => setNewSubdomain(e.target.value.toLowerCase())}
            suffix={`.${name}`}
            error={isSubdomainInvalid()}
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
                {isLoading ? <Spinner color="blue" /> : "Save"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
