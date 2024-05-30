import { BackButton, NextButton } from "@/components/01-atoms";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { PlusSVG, MinusSVG } from "@ensdomains/thorin";

interface RegistrationYearsComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export function RegistrationYearsComponent({
  handlePreviousStep,
  handleNextStep,
}: RegistrationYearsComponentProps) {
  const { nameRegistrationData, setRegistrationYears } = useNameRegistration();

  const { registrationYears } = nameRegistrationData;

  const handlePlusButtonClick = () => {
    setRegistrationYears(registrationYears + 1);
  };

  const handleMinusButtonClick = () => {
    setRegistrationYears(registrationYears - 1);
  };

  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />

      <div className="max-w-[500px] w-full flex flex-col gap-7">
        <h3 className="text-start text-[34px] font-medium">
          How many years do you want to register this domain?
        </h3>
        <div className="flex">
          <div className="flex justify-between items-center border border-gray-200 rounded-[8px] overflow-hidden">
            <button
              disabled={registrationYears === 1}
              onClick={handleMinusButtonClick}
              className="p-4 border-r border-gray-200 hover:bg-gray-50"
            >
              <MinusSVG className="w-3 h-3 text-gray-500" />
            </button>
            <div className="w-[120px]">{registrationYears}</div>
            <button
              onClick={handlePlusButtonClick}
              className="p-4 border-l border-gray-200 hover:bg-gray-50"
            >
              <PlusSVG className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
      <NextButton onClick={handleNextStep} />
    </div>
  );
}
