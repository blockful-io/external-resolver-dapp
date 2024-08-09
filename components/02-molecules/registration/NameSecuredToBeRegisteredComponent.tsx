import { BackButton, BlockchainCTA } from "@/components/01-atoms";
import { register } from "@/lib/utils/blockchain-txs";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { TransactionErrorType } from "@/lib/wallet/txError";
import { TransactionReceipt } from "viem";
import { useAccount } from "wagmi";

interface NameSecuredToBeRegisteredComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const NameSecuredToBeRegisteredComponent = ({
  handlePreviousStep,
  handleNextStep,
}: NameSecuredToBeRegisteredComponentProps) => {
  const { address } = useAccount();
  const { nameRegistrationData, setCommitTxReceipt, getResolverAddress } =
    useNameRegistration();

  const registerName = async (): Promise<
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

    let resolverAddress = getResolverAddress();

    return await register({
      authenticatedAddress: address,
      ensName: nameRegistrationData.name,
      resolverAddress: resolverAddress,
      durationInYears: BigInt(nameRegistrationData.registrationYears),
      registerAndSetAsPrimaryName: nameRegistrationData.asPrimaryName,
    });
  };

  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} disabled={true} />
      <div className="max-w-[500px] w-full flex items-start flex-col gap-4 min-h-[300px]">
        <h3 className="text-7xl">🤝</h3>
        <h3 className="text-start text-[34px] font-medium">
          Now let&apos;s do the register transaction
        </h3>
        <p className="text-gray-500 text-left text-base">
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
