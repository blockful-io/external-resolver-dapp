import { BackButton, NextButton } from "@/components/01-atoms";
import { MinusSVG, PlusSVG } from "@ensdomains/thorin";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { setNameRegistrationInLocalStorage } from "@/lib/name-registration/localStorage";
import { useAccount } from "wagmi";

interface RegistrationYearsComponentProps {
  handleNextStep: () => void;
}

export const RegistrationYearsComponent = ({
  handleNextStep,
}: RegistrationYearsComponentProps) => {
  const { nameRegistrationData, setRegistrationYears } = useNameRegistration();
  const { address } = useAccount();
  const { registrationYears } = nameRegistrationData;

  const handlePlusButtonClick = () => {
    setRegistrationYears(registrationYears + 1);
  };

  const handleMinusButtonClick = () => {
    setRegistrationYears(registrationYears - 1);
  };

  const saveRegistrationYearsInLocalStorage = () => {
    if (address && nameRegistrationData.name) {
      setNameRegistrationInLocalStorage(address, nameRegistrationData.name, {
        registrationYears,
      });
    }
  };

  return (
    <div className="flex flex-col items-start justify-start gap-[44px]">
      <BackButton onClick={() => {}} disabled={true} />
      <div className="flex min-h-[300px] w-full max-w-[500px] flex-col gap-7">
        <h3 className="text-start text-[34px] font-medium">
          How many years do you want to register this domain?
        </h3>
        <div className="flex">
          <div className="flex items-center justify-between overflow-hidden rounded-lg border border-gray-200">
            <button
              disabled={registrationYears === 1}
              onClick={handleMinusButtonClick}
              className="border-r border-gray-200 p-4 hover:bg-gray-50"
            >
              <MinusSVG className="h-3 w-3 text-gray-500" />
            </button>
            <div className="w-[120px]">{registrationYears}</div>
            <button
              onClick={handlePlusButtonClick}
              className="border-l border-gray-200 p-4 hover:bg-gray-50"
            >
              <PlusSVG className="h-3 w-3 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex w-full">
        <NextButton
          onClick={() => {
            saveRegistrationYearsInLocalStorage();
            handleNextStep();
          }}
        />
      </div>
    </div>
  );
};
