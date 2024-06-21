import { BackButton, NextButton } from "@/components/01-atoms";

interface RegisterComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const RegisterComponent = ({
  handlePreviousStep,
  handleNextStep,
}: RegisterComponentProps) => {
  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />
      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        <h3 className="text-7xl">🎉</h3>
        <h3 className="text-start text-[34px] font-medium">
          Congrats! You&apos;re now owner of isadoranunes.eth
        </h3>
        <p className="text-gray-500 text-left text-base">
          Your name was successfully registered, you can now view and manage it.
        </p>
      </div>
      <NextButton onClick={handleNextStep} />
    </div>
  );
};
