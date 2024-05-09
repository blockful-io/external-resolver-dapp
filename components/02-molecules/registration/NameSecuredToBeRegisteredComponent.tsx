import BackButton from "@/components/01-atoms/BackButton";
import NextButton from "@/components/01-atoms/NextButton";

interface NameSecuredToBeRegisteredComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export function NameSecuredToBeRegisteredComponent({
  handlePreviousStep,
  handleNextStep,
}: NameSecuredToBeRegisteredComponentProps) {
  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />
      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        <h3 className="text-[72px]">🤝</h3>
        <h3 className="text-start text-[34px] font-medium">
          Now let&apos;s do the actual transaction
        </h3>
        <p className="text-gray-500 text-left text-[16px]">
          The domain is almost yours! Double check the information before
          confirming in your wallet.
        </p>
      </div>
      <NextButton onClick={handleNextStep} />
    </div>
  );
}
