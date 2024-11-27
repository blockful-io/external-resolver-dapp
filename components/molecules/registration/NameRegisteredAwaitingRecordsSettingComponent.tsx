import { BackButton, BlockchainCTA } from "@/components/atoms";
import { setDomainRecords } from "@/ens-sdk";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import {
  TransactionErrorType,
  getBlockchainTransactionError,
} from "@/lib/wallet/txError";
import { useEffect } from "react";
import { PublicClient, TransactionReceipt, WalletClient } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";

interface NameRegisteredAwaitingRecordsSettingComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const NameRegisteredAwaitingRecordsSettingComponent = ({
  handlePreviousStep,
  handleNextStep,
}: NameRegisteredAwaitingRecordsSettingComponentProps) => {
  const { address, chain } = useAccount();
  const { nameRegistrationData, getResolverAddress } = useNameRegistration();

  const publicClient = usePublicClient() as PublicClient &
    WalletClient &
    ClientWithEns;

  const setTextRecords = async (): Promise<
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

    if (
      !Object.entries(nameRegistrationData.textRecords).length &&
      !Object.entries(nameRegistrationData.domainAddresses).length
    ) {
      handleNextStep();
    }

    const resolverAddress = getResolverAddress();

    try {
      const setDomainRecordsRes = await setDomainRecords({
        others: {},
        authenticatedAddress: address,
        ensName: nameRegistrationData.name,
        textRecords: nameRegistrationData.textRecords,
        resolverAddress: resolverAddress,
        addresses: nameRegistrationData.domainAddresses,
        client: publicClient,
        chain: chain,
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
    <div className="flex flex-col items-start justify-start gap-[44px]">
      <BackButton onClick={handlePreviousStep} disabled={true} />
      <div className="flex min-h-[300px] w-full max-w-[500px] flex-col items-start gap-4">
        <h3 className="text-7xl">💬</h3>
        <h3 className="text-start text-[34px] font-medium">
          Now let&apos;s set the text records
        </h3>
        <p className="text-left text-base text-gray-500">
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
