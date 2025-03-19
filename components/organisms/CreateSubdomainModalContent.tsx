import { Button, Input, Spinner } from "@ensdomains/thorin";
import { buildENSName } from "@namehash/ens-utils";
import { normalize } from "viem/ens";
import { useState } from "react";
import toast from "react-hot-toast";
import { Address, isAddress } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { createSubname } from "ensjs-monorepo/packages/ensjs/dist/esm/wallet";

import { NewSubdomainInfo } from "./NewSubdomainInfo";
interface CreateSubdomainModalContentProps {
  name: string;
  resolverAddress: Address;
  onCloseModal: () => void;
  onRecordsEdited?: () => void;
  alreadyCreatedSubdomains?: string[];
}

enum CreateSubdomainModalSteps {
  SubdomainInput = "SubdomainInput",
  ProfileSettings = "ProfileSettings",
  Confirmation = "Confirmation",
  Success = "Success",
}

export const CreateSubdomainModalContent = ({
  resolverAddress,
  onCloseModal,
  onRecordsEdited,
  name,
  alreadyCreatedSubdomains,
}: CreateSubdomainModalContentProps) => {
  const [newSubdomain, setNewSubdomain] = useState("");
  const [resolver, setResolver] = useState(resolverAddress);
  const [subdomainAddress, setSubdomainAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsloading] = useState(false);
  const authedUser = useAccount();
  const [currentStep, setCurrentStep] = useState<CreateSubdomainModalSteps>(
    CreateSubdomainModalSteps.SubdomainInput,
  );
  const { chain } = useAccount();
  const walletClient = useWalletClient({
    chainId: chain?.id,
  });

  const isSubdomainInvalid = () => {
    try {
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

    if (!chain) {
      return toast.error(
        "Impossible to create a subdomain if you are not connected to a chain",
      );
    }

    try {
      await createSubname(walletClient.data, {
        name: `${newSubdomain}.${name}`,
        owner: authedUser.address!,
        resolverAddress,
        expiry: 31622400n,
        contract: "nameWrapper",
        fuses: 0,
      });

      !!onRecordsEdited && onRecordsEdited();
      toast.success("Subdomain created successfully 🙂");
      setCurrentStep(CreateSubdomainModalSteps.Success);
    } catch (error: any) {
      toast.error(error.cause?.reason ?? "Error creating subdomain");
    } finally {
      setIsloading(false);
    }
  };

  var urlRegex =
    /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;

  // Map each step to a corresponding JSX element
  const stepComponents: Record<CreateSubdomainModalSteps, JSX.Element> = {
    [CreateSubdomainModalSteps.SubdomainInput]: (
      <>
        <Input
          clearable
          label={"Subdomain"}
          type="text"
          value={newSubdomain}
          onChange={(e) => setNewSubdomain(e.target.value.toLowerCase())}
          suffix={
            <div className="max-w-48 truncate whitespace-nowrap">{`.${name}`}</div>
          }
          error={isSubdomainInvalid()}
        />
        <Input
          clearable
          label={"Resolver address"}
          placeholder={resolverAddress}
          type="text"
          value={resolver}
          onChange={(e) => setResolver(e.target.value as Address)}
          error={!isAddress(resolver) && "Invalid Address"}
        />
      </>
    ),
    [CreateSubdomainModalSteps.ProfileSettings]: (
      <>
        <Input
          clearable
          label={"ETH Address"}
          placeholder={""}
          type="text"
          value={subdomainAddress}
          onChange={(e) => setSubdomainAddress(e.target.value.toLowerCase())}
          error={
            subdomainAddress.length &&
            !isAddress(subdomainAddress) &&
            "Invalid Address"
          }
        />
        <Input
          clearable
          label={"Website"}
          placeholder={""}
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value.toLowerCase())}
          error={
            website !== "" && !website.match(urlRegex) && "Invalid Website"
          }
        />
        <Input
          clearable
          label={"Description"}
          placeholder={""}
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value.toLowerCase())}
        />
      </>
    ),
    [CreateSubdomainModalSteps.Confirmation]: (
      <NewSubdomainInfo
        domain={`${newSubdomain}.${name}`}
        description={description}
        website={website}
        ethAddress={subdomainAddress}
      />
    ),
    [CreateSubdomainModalSteps.Success]: (
      <div className="flex w-full flex-col items-center justify-center gap-4 px-10">
        <p className="text-7xl"> 🎉</p>
        <div className="flex flex-col items-center justify-center">
          <p className="text-lg">
            <span className="text-[26px] font-bold">
              Congrats! You&apos;re now owner of
            </span>
          </p>
          <p className="text-gradient-ens text-center text-[26px] font-bold">{`${newSubdomain}.${name}`}</p>
          <p className="text-gray-400">
            Your transaction was successfully completed.
          </p>
        </div>
      </div>
    ),
  };

  // Map each step to a corresponding validation function
  const stepValidation: Record<CreateSubdomainModalSteps, () => boolean> = {
    [CreateSubdomainModalSteps.SubdomainInput]: () =>
      !!newSubdomain && isAddress(resolver),
    [CreateSubdomainModalSteps.ProfileSettings]: () =>
      !subdomainAddress || isAddress(subdomainAddress),
    [CreateSubdomainModalSteps.Confirmation]: () => true,
    [CreateSubdomainModalSteps.Success]: () => true,
  };

  const handleNextStep = () => {
    switch (currentStep) {
      case CreateSubdomainModalSteps.SubdomainInput:
        setCurrentStep(CreateSubdomainModalSteps.ProfileSettings);
        break;
      case CreateSubdomainModalSteps.ProfileSettings:
        setCurrentStep(CreateSubdomainModalSteps.Confirmation);
        break;
      case CreateSubdomainModalSteps.Confirmation:
        setCurrentStep(CreateSubdomainModalSteps.Success);
        break;
      case CreateSubdomainModalSteps.Success:
        setCurrentStep(CreateSubdomainModalSteps.SubdomainInput);
        break;
    }
  };

  return (
    <div className="w-[640px] overflow-hidden rounded-xl border">
      <div className="flex w-full justify-between border-b bg-gray-50 px-6 py-5 font-semibold text-black">
        New subdomain
      </div>
      <div className="flex flex-col gap-4 border-b border-gray-200 bg-white p-6 text-black">
        {stepComponents[currentStep]}

        {isLoading && <h1>Check your wallet</h1>}
      </div>

      <div className="flex w-full justify-end gap-4 bg-white px-6 py-5">
        {currentStep === CreateSubdomainModalSteps.Success ? (
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
            {currentStep === CreateSubdomainModalSteps.Confirmation ? (
              <div>
                <Button disabled={isLoading} onClick={handleSaveAction}>
                  {isLoading ? <Spinner color="blue" /> : "Save"}
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  disabled={isLoading || !stepValidation[currentStep]()}
                  onClick={handleNextStep}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
