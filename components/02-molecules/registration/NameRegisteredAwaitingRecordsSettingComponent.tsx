import { BackButton, BlockchainCTA } from "@/components/01-atoms";
import { setDomainRecords } from "@/lib/name-registration/blockchain-txs";
import { ENSResolverToNetwork } from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import {
  TransactionErrorType,
  getBlockchainTransactionError,
} from "@/lib/wallet/txError";
import { useUser } from "@/lib/wallet/useUser";
import { Button, WalletSVG } from "@ensdomains/thorin";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect } from "react";
import { TransactionReceipt } from "viem";

interface NameRegisteredAwaitingRecordsSettingComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const NameRegisteredAwaitingRecordsSettingComponent = ({
  handlePreviousStep,
  handleNextStep,
}: NameRegisteredAwaitingRecordsSettingComponentProps) => {
  const { authedUser } = useUser();
  const { nameRegistrationData } = useNameRegistration();
  const { openConnectModal } = useConnectModal();

  const setTextRecords = async (): Promise<
    `0x${string}` | TransactionErrorType | null
  > => {
    if (!authedUser) {
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

    try {
      await setDomainRecords({
        authenticatedAddress: authedUser,
        ensName: nameRegistrationData.name,
        textRecords: nameRegistrationData.textRecords,
        domainResolver: nameRegistrationData.ensResolver,
        addresses: nameRegistrationData.domainAddresses,
      });

      return null;
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
      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        <h3 className="text-7xl">💬</h3>
        <h3 className="text-start text-[34px] font-medium">
          Now let&apos;s set the text records
        </h3>
        <p className="text-gray-500 text-left text-base">
          The domain is already yours and will now be customized! Each text
          record set in the previous step will trigger one blockchain
          transaction that should be accepted by you!
        </p>
      </div>
      <div>
        {!authedUser ? (
          <Button
            colorStyle="bluePrimary"
            onClick={openConnectModal}
            prefix={<WalletSVG />}
          >
            Open Wallet
          </Button>
        ) : (
          <BlockchainCTA
            onSuccess={(txReceipt: TransactionReceipt) => {
              setTimeout(handleNextStep, 5000);
            }}
            transactionRequest={setTextRecords}
          />
        )}
      </div>
    </div>
  );
};
