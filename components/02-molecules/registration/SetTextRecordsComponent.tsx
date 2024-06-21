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
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />
      <div className="max-w-[500px] w-full flex items-start flex-col gap-4">
        <h3 className="text-7xl">⚙️</h3>
        <h3 className="text-start text-[34px] font-medium">
          Let&apos;s set your profile settings
        </h3>
        <p className="text-gray-500 text-left text-base">
          Adjust your information and personalize your profile while we secure
          your domain.
        </p>
      </div>
      <NextButton onClick={handleNextStep} />
    </div>
  );
};