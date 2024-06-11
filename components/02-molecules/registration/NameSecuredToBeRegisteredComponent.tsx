import { BackButton, BlockchainCTA, NextButton } from "@/components/01-atoms";
import { register } from "@/lib/name-registration/blockchain-txs";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { TransactionErrorType } from "@/lib/wallet/txError";
import { useUser } from "@/lib/wallet/useUser";
import { Button, WalletSVG } from "@ensdomains/thorin";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { TransactionReceipt } from "viem";

interface NameSecuredToBeRegisteredComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const NameSecuredToBeRegisteredComponent = ({
  handlePreviousStep,
  handleNextStep,
}: NameSecuredToBeRegisteredComponentProps) => {
  const { authedUser } = useUser();
  const { nameRegistrationData, setCommitTxReceipt } = useNameRegistration();
  const { openConnectModal } = useConnectModal();

  const registerName = async (): Promise<
    `0x${string}` | TransactionErrorType
  > => {
    if (!authedUser) {
      throw new Error(
        "Impossible to register a name without an authenticated user"
      );
    }

    if (!nameRegistrationData.name) {
      throw new Error("Impossible to register a name without a name");
    }

    return await register({
      authenticatedAddress: authedUser,
      ensName: nameRegistrationData.name,
      domainResolver: nameRegistrationData.ensResolver,
      durationInYears: BigInt(nameRegistrationData.registrationYears),
      registerAndSetAsPrimaryName: nameRegistrationData.asPrimaryName,
    });
  };

  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />
      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        <h3 className="text-[72px]">🤝</h3>
        <h3 className="text-start text-[34px] font-medium">
          Now let&apos;s do the actual transaction
        </h3>
        <p className="text-gray-500 text-left text-base">
          The domain is almost yours! Double check the information before
          confirming in your wallet.
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
              setCommitTxReceipt(txReceipt);

              setTimeout(handleNextStep, 5000);
            }}
            transactionRequest={registerName}
          />
        )}
      </div>
    </div>
  );
};
