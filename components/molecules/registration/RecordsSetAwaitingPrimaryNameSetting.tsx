import { BackButton, BlockchainCTA } from "@/components/atoms";
import { setDomainAsPrimaryName } from "@/ens-sdk";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import {
  TransactionErrorType,
  getBlockchainTransactionError,
} from "@/lib/wallet/txError";
import { useEffect } from "react";
import { TransactionReceipt } from "viem";
import { useAccount } from "wagmi";

interface NameRegisteredAwaitingRecordsSettingComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const RecordsSetAwaitingPrimaryNameSetting = ({
  handlePreviousStep,
  handleNextStep,
}: NameRegisteredAwaitingRecordsSettingComponentProps) => {
  const { address, chain } = useAccount();
  const { nameRegistrationData } = useNameRegistration();

  useEffect(() => {
    if (!nameRegistrationData.asPrimaryName) {
      handleNextStep();
    }
  }, []);

  const setAsPrimaryName = async (): Promise<
    `0x${string}` | TransactionErrorType | null
  > => {
    if (!address) {
      throw new Error(
        "Impossible to set the text records of a name without an authenticated user",
      );
    }

    if (!chain) {
      throw new Error(
        "Impossible to set the text records of a name without a chain",
      );
    }

    if (!nameRegistrationData.name) {
      throw new Error(
        "Impossible to set the text records of a name without a name",
      );
    }

    try {
      const setAsPrimaryNameRes = await setDomainAsPrimaryName({
        authenticatedAddress: address,
        ensName: nameRegistrationData.name,
        chain: chain,
      });

      if (
        setAsPrimaryNameRes === null ||
        typeof setAsPrimaryNameRes === "number"
      ) {
        return null;
      } else {
        throw new Error(setAsPrimaryNameRes);
      }
    } catch (error) {
      console.error(error);
      const errorType = getBlockchainTransactionError(error);
      return errorType;
    }
  };

  useEffect(() => {
    if (!Object.entries(nameRegistrationData.textRecords).length) {
      handleNextStep();
    }
  }, []);

  return (
    <div className="flex flex-col items-start justify-start gap-[44px]">
      <BackButton onClick={handlePreviousStep} disabled={true} />
      <div className="flex w-full max-w-[500px] flex-col items-start gap-4">
        <h3 className="text-7xl">👾</h3>
        <h3 className="text-start text-[34px] font-medium">
          And finally, set it as your primary name
        </h3>
        <p className="text-left text-base text-gray-500">
          The domain is already yours and the text records are set. Now you can
          set it as your primary name. This will make it easier to use it across
          the web3 space.
        </p>
      </div>
      <div className="flex flex-col space-y-4">
        <BlockchainCTA
          onSuccess={(txReceipt: TransactionReceipt) => {
            setTimeout(handleNextStep, 5000);
          }}
          transactionRequest={setAsPrimaryName}
        />
      </div>
    </div>
  );
};
