import { BackButton, BlockchainCTA } from "@/components/01-atoms";
import { setDomainRecords } from "@/lib/utils/blockchain-txs";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import {
  TransactionErrorType,
  getBlockchainTransactionError,
} from "@/lib/wallet/txError";
import { useEffect } from "react";
import { TransactionReceipt } from "viem";
import { useAccount } from "wagmi";
import { getResolverAddress } from "@/lib/name-registration/utils";

interface NameRegisteredAwaitingRecordsSettingComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const NameRegisteredAwaitingRecordsSettingComponent = ({
  handlePreviousStep,
  handleNextStep,
}: NameRegisteredAwaitingRecordsSettingComponentProps) => {
  const { address } = useAccount();
  const { nameRegistrationData } = useNameRegistration();

  const setTextRecords = async (): Promise<
    `0x${string}` | TransactionErrorType | null
  > => {
    if (!address) {
      throw new Error(
        "Impossible to set the text records of a name without an authenticated user"
      );
    }

    if (!nameRegistrationData.name) {
      throw new Error(
        "Impossible to set the text records of a name without a name"
      );
    }

    if (
      !Object.entries(nameRegistrationData.textRecords).length &&
      !Object.entries(nameRegistrationData.domainAddresses).length
    ) {
      handleNextStep();
    }

    let resolverAddress = getResolverAddress(
      nameRegistrationData.ensResolver,
      nameRegistrationData.customResolverAddress
    );

    try {
      const setDomainRecordsRes = await setDomainRecords({
        authenticatedAddress: address,
        ensName: nameRegistrationData.name,
        textRecords: nameRegistrationData.textRecords,
        resolverAddress: resolverAddress,
        addresses: nameRegistrationData.domainAddresses,
      });

      if (
        setDomainRecordsRes === null ||
        typeof setDomainRecordsRes === "number"
      ) {
        return null;
      } else {
        throw new Error(setDomainRecordsRes);
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
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} disabled={true} />
      <div className="max-w-[500px] w-full flex items-start flex-col gap-4 min-h-[300px]">
        <h3 className="text-7xl">💬</h3>
        <h3 className="text-start text-[34px] font-medium">
          Now let&apos;s set the text records
        </h3>
        <p className="text-gray-500 text-left text-base">
          The domain is already yours and will now be customized! The records
          set in the previous steps will be registered, please sign a message to
          confirm this action.
        </p>
      </div>
      <div className="flex flex-col space-y-4">
        <BlockchainCTA
          onSuccess={(txReceipt: TransactionReceipt) => {
            setTimeout(handleNextStep, 5000);
          }}
          transactionRequest={setTextRecords}
        />
      </div>
    </div>
  );
};
