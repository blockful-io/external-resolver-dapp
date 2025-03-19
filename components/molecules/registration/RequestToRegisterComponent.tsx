import { Button, WalletSVG } from "@ensdomains/thorin";
import {
  BackButton,
  BlockchainCTA,
  TransactionConfirmedInBlockchainCTA,
} from "@/components/atoms";
import { commit } from "@/lib/utils/blockchain-txs";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { useAccount, useBalance, usePublicClient } from "wagmi";
import { TransactionErrorType } from "@/lib/wallet/txError";
import { setNameRegistrationInLocalStorage } from "@/lib/name-registration/localStorage";
import { PublicClient } from "viem";
import { ClientWithEns } from "ensjs-monorepo/packages/ensjs/dist/esm/contracts/consts";

interface RequestToRegisterComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const RequestToRegisterComponent = ({
  handlePreviousStep,
  handleNextStep,
}: RequestToRegisterComponentProps) => {
  const { address, chain } = useAccount();

  const { data: ethBalance } = useBalance({
    address,
    chainId: chain?.id,
  });
  const { nameRegistrationData, setCommitSubmitTimestamp, getResolverAddress } =
    useNameRegistration();

  const publicClient = usePublicClient() as PublicClient & ClientWithEns;

  const commitToRegister = async (): Promise<
    `0x${string}` | TransactionErrorType
  > => {
    if (!address) {
      throw new Error(
        "Impossible to register a name without an authenticated user",
      );
    }

    if (!chain) {
      throw new Error("Impossible to register a name without a chain");
    }

    if (!nameRegistrationData.name) {
      throw new Error("Impossible to register a name without a name");
    }

    const resolverAddress = getResolverAddress();

    return await commit({
      authenticatedAddress: address,
      ensName: nameRegistrationData.name,
      resolverAddress: resolverAddress,
      durationInYears: BigInt(nameRegistrationData.registrationYears),
      registerAndSetAsPrimaryName: nameRegistrationData.asPrimaryName,
      publicClient: publicClient,
      chain: chain,
    });
  };

  const saveCommitSubmitTimestampInLocalStorage = (date: Date) => {
    if (address && nameRegistrationData.name) {
      setNameRegistrationInLocalStorage(address, nameRegistrationData.name, {
        commitTimestamp: date,
      });
    }
  };

  return (
    <div className="flex flex-col items-start justify-start gap-[44px]">
      <BackButton onClick={handlePreviousStep} disabled={true} />

      <div className="flex min-h-[300px] w-full max-w-[500px] flex-col items-start gap-4">
        <h3 className="text-7xl">📝</h3>
        <h3 className="text-start text-[34px] font-medium">
          Start name registration
        </h3>
        <p className="text-left text-base text-gray-500">
          First, a transaction is performed so that no one else can view the
          name you&apos;re trying to register.
        </p>
      </div>

      <div>
        {!address ? (
          <BlockchainCTA />
        ) : nameRegistrationData.commitTxReceipt ? (
          <TransactionConfirmedInBlockchainCTA onClick={() => {}} />
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
              const commitTimestamp = new Date();
              setCommitSubmitTimestamp(commitTimestamp);
              saveCommitSubmitTimestampInLocalStorage(commitTimestamp);
              handleNextStep();
            }}
            transactionRequest={commitToRegister}
          />
        )}
      </div>
    </div>
  );
};
