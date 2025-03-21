import { Hash } from "viem";
import { useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { setRecords } from "ensjs-monorepo/packages/ensjs/dist/esm/wallet";

import { BackButton, BlockchainCTA } from "@/components/atoms";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { WalletClientWithAccount } from "ensjs-monorepo/packages/ensjs/dist/types/contracts/consts";

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
  const walletClient = useWalletClient({
    chainId: chain?.id,
  });

  async function setTextRecords(): Promise<Hash> {
    if (
      !Object.entries(nameRegistrationData.textRecords).length &&
      !Object.entries(nameRegistrationData.domainAddresses).length
    ) {
      handleNextStep();
    }

    const resolverAddress = getResolverAddress();

    const texts = Object.entries(nameRegistrationData.textRecords).map(
      ([key, value]) => ({
        key,
        value,
      }),
    );

    const coins = Object.entries(nameRegistrationData.domainAddresses).map(
      ([coin, value]) => ({
        coin,
        value,
      }),
    );

    return await setRecords(walletClient.data! as WalletClientWithAccount, {
      name: nameRegistrationData.name?.name || "", // TODO: this nameRegistrationData.name?.name null should throw an error
      coins,
      texts,
      account: address!,
      resolverAddress,
    });
  }

  useEffect(() => {
    if (!Object.entries(nameRegistrationData.textRecords).length) {
      handleNextStep();
    }
  }, [handleNextStep, nameRegistrationData.textRecords]);

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
          onSuccess={() => {
            setTimeout(handleNextStep, 5000);
          }}
          transactionRequest={setTextRecords}
        />
      </div>
    </div>
  );
};
