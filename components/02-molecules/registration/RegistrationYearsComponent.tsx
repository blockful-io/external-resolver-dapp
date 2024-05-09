import BackButton from "@/components/01-atoms/BackButton";
import NextButton from "@/components/01-atoms/NextButton";
import { PlusSVG, MinusSVG } from "@ensdomains/thorin";

interface RegistrationYearsComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export function RegistrationYearsComponent({
  handlePreviousStep,
  handleNextStep,
}: RegistrationYearsComponentProps) {
  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />

      <div className="max-w-[500px] w-full flex flex-col gap-7">
        <h3 className="text-start text-[34px] font-medium">
          How many years do you want to register this domain?
        </h3>
        <div className="flex">
          <div className="flex justify-between items-center border border-gray-200 rounded-[8px]">
            <div className="p-4 border-r border-gray-200">
              <MinusSVG className="w-3 h-3 text-gray-500" />
            </div>
            <div className="w-[120px]">1</div>
            <div className="p-4 border-l border-gray-200">
              <PlusSVG className="w-3 h-3 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
      <NextButton onClick={handleNextStep} />
    </div>
  );
}
