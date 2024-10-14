import { BackButton, NextButton } from "@/components/01-atoms";

interface SetTextRecordsComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const SetTextRecordsComponent = ({
  handlePreviousStep,
  handleNextStep,
}: SetTextRecordsComponentProps) => {
  return (
    <div className="flex flex-col items-start justify-start gap-[44px]">
      <BackButton onClick={handlePreviousStep} disabled={true} />
      <div className="flex min-h-[300px] w-full max-w-[500px] flex-col items-start gap-4">
        <h3 className="text-7xl">⚙️</h3>
        <h3 className="text-start text-[34px] font-medium">
          Let&apos;s set your domain records
        </h3>
        <p className="text-left text-base text-gray-500">
          Adjust your information and personalize your profile while we secure
          your domain.
        </p>
      </div>
      <div className="flex w-full">
        <NextButton onClick={handleNextStep} />
      </div>
    </div>
  );
};
