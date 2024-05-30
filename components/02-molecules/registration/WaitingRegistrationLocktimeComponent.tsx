import { BackButton, NextButton } from "@/components/01-atoms";

interface WaitingRegistrationLocktimeComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export function WaitingRegistrationLocktimeComponent({
  handlePreviousStep,
  handleNextStep,
}: WaitingRegistrationLocktimeComponentProps) {
  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />
      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        <h3 className="text-[72px]">🔒</h3>
        <h3 className="text-start text-[34px] font-medium">
          We are securing your domain
        </h3>
        <p className="text-gray-500 text-left text-[16px]">
          Please just wait a few seconds while we do this operation.
        </p>
      </div>
      <NextButton onClick={handleNextStep} />
    </div>
  );
}
