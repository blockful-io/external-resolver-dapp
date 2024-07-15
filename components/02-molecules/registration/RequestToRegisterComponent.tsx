import { Button, WalletSVG } from "@ensdomains/thorin";
import {
  BackButton,
  BlockchainCTA,
  TransactionConfirmedInBlockchainCTA,
} from "@/components/01-atoms";
import { commit } from "@/lib/utils/blockchain-txs";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
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
  const { address } = useAccount();
  const { data: ethBalance } = useBalance({
    address,
    chainId: isTestnet ? SupportedNetwork.TESTNET : SupportedNetwork.MAINNET,
  });
  const { nameRegistrationData, setCommitSubmitTimestamp } =
    useNameRegistration();
  const { openConnectModal } = useConnectModal();

  const commitToRegister = async (): Promise<
    `0x${string}` | TransactionErrorType
  > => {
    if (!address) {
      throw new Error(
        "Impossible to register a name without an authenticated user"
      );
    }

    if (!nameRegistrationData.name) {
      throw new Error("Impossible to register a name without a name");
    }

    return await commit({
      authenticatedAddress: address,
      ensName: nameRegistrationData.name,
      domainResolver: nameRegistrationData.ensResolver,
      durationInYears: BigInt(nameRegistrationData.registrationYears),
      registerAndSetAsPrimaryName: nameRegistrationData.asPrimaryName,
    });
  };

  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} disabled={true} />

      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        <h3 className="text-7xl">📝</h3>
        <h3 className="text-start text-[34px] font-medium">
          Start name registration
        </h3>
        <p className="text-gray-500 text-left text-base">
          First, a transaction is performed so that no one else can view the
          name you&apos;re trying to register.
        </p>
      </div>

      <div>
        {nameRegistrationData.commitTxReceipt ? (
          <TransactionConfirmedInBlockchainCTA onClick={() => {}} />
        ) : !address ? (
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
            onSuccess={() => {
              setCommitSubmitTimestamp(new Date());
              handleNextStep();
            }}
            transactionRequest={commitToRegister}
          />
        )}
      </div>
    </div>
  );
};
