import { Button, WalletSVG } from "@ensdomains/thorin";
import {
  BackButton,
  BlockchainCTA,
  TransactionConfirmedInBlockchainCTA,
} from "@/components/01-atoms";
import { commit } from "@/lib/name-registration/blockchain-txs";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { useUser } from "@/lib/wallet/useUser";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useBalance } from "wagmi";
import { SupportedNetwork, isTestnet } from "@/lib/wallet/chains";
import { TransactionErrorType } from "@/lib/wallet/txError";

interface RequestToRegisterComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const RequestToRegisterComponent = ({
  handlePreviousStep,
  handleNextStep,
}: RequestToRegisterComponentProps) => {
  const { authedUser } = useUser();
  const { data: ethBalance } = useBalance({
    address: authedUser as `0x${string}`,
    chainId: isTestnet ? SupportedNetwork.TESTNET : SupportedNetwork.MAINNET,
  });
  const { nameRegistrationData } = useNameRegistration();
  const { openConnectModal } = useConnectModal();

  const commitToRegister = async (): Promise<
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

    return await commit({
      authenticatedAddress: authedUser,
      ensName: nameRegistrationData.name,
      durationInYears: BigInt(nameRegistrationData.registrationYears),
      registerAndSetAsPrimaryName: nameRegistrationData.asPrimaryName,
    });
  };

  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />

      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        <h3 className="text-[72px]">📝</h3>
        <h3 className="text-start text-[34px] font-medium">
          Start registration process
        </h3>
        <p className="text-gray-500 text-left text-[16px]">
          First, a 0 ETH transaction is performed where your name is hashed with
          a secret key so that no one else can view the name you&apos;re trying
          to register.
        </p>
      </div>

      <div>
        {nameRegistrationData.commitTxReceipt ? (
          <TransactionConfirmedInBlockchainCTA onClick={() => {}} />
        ) : !authedUser ? (
          <Button
            colorStyle="bluePrimary"
            onClick={openConnectModal}
            prefix={<WalletSVG />}
          >
            Open Wallet
          </Button>
        ) : typeof ethBalance === "undefined" ||
          !nameRegistrationData.registrationPrice ? (
          <Button colorStyle="blueSecondary" disabled>
            Loading balance...
          </Button>
        ) : ethBalance.value < nameRegistrationData.registrationPrice ? (
          <Button colorStyle="redSecondary" className="pointer-events-none">
            Insufficient ETH balance
          </Button>
        ) : (
          <BlockchainCTA
            onSuccess={handleNextStep}
            transactionRequest={commitToRegister}
          />
        )}
      </div>
    </div>
  );
};
