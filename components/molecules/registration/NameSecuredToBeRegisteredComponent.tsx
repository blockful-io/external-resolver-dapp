import { BackButton, BlockchainCTA } from "@/components/atoms";
import { register } from "@/lib/utils/blockchain-txs";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { TransactionErrorType } from "@/lib/wallet/txError";
import { PublicClient, TransactionReceipt } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { ClientWithEns } from "ensjs-monorepo/packages/ensjs/src/contracts/consts";

interface NameSecuredToBeRegisteredComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const NameSecuredToBeRegisteredComponent = ({
  handlePreviousStep,
  handleNextStep,
}: NameSecuredToBeRegisteredComponentProps) => {
  const { address, chain } = useAccount();
  const { nameRegistrationData, setCommitTxReceipt, getResolverAddress } =
    useNameRegistration();

  const publicClient = usePublicClient() as PublicClient & ClientWithEns;

  const registerName = async (): Promise<
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

    return await register({
      authenticatedAddress: address,
      ensName: nameRegistrationData.name,
      resolverAddress: resolverAddress,
      durationInYears: BigInt(nameRegistrationData.registrationYears),
      registerAndSetAsPrimaryName: nameRegistrationData.asPrimaryName,
      publicClient: publicClient,
      chain: chain,
    });
  };

  return (
    <div className="flex flex-col items-start justify-start gap-[44px]">
      <BackButton onClick={handlePreviousStep} disabled={true} />
      <div className="flex min-h-[300px] w-full max-w-[500px] flex-col items-start gap-4">
        <h3 className="text-7xl">🤝</h3>
        <h3 className="text-start text-[34px] font-medium">
          Now let&apos;s do the register transaction
        </h3>
        <p className="text-left text-base text-gray-500">
          The domain is almost yours! Double check the infos on your wallet and
          accept the registration transaction.
        </p>
      </div>
      <div>
        <BlockchainCTA
          onSuccess={(txReceipt: TransactionReceipt) => {
            setCommitTxReceipt(txReceipt);

            setTimeout(handleNextStep, 5000);
          }}
          transactionRequest={registerName}
        />
      </div>
    </div>
  );
};
