import { BackButton, NextButton } from "@/components/01-atoms";
import { setNameRegistrationInLocalStorage } from "@/lib/name-registration/localStorage";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { RadioButton } from "@ensdomains/thorin";
import { useRef } from "react";
import { useAccount } from "wagmi";

interface PrimaryNameComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const PrimaryNameComponent = ({
  handlePreviousStep,
  handleNextStep,
}: PrimaryNameComponentProps) => {
  const radioButtonRefYes = useRef(null);
  const radioButtonRefNo = useRef(null);
  const { address } = useAccount();

  const { nameRegistrationData, setAsPrimaryName } = useNameRegistration();

  const { asPrimaryName } = nameRegistrationData;

  const handleDivClick = (radioRef: React.RefObject<HTMLInputElement>) => {
    radioRef?.current?.click();
  };

  const saveAsPrimaryNameInLocalStorage = () => {
    if (address && nameRegistrationData.name) {
      setNameRegistrationInLocalStorage(address, nameRegistrationData.name, {
        asPrimaryName,
      });
    }
  };

  return (
    <div className="flex flex-col items-start justify-start gap-[44px]">
      <BackButton onClick={handlePreviousStep} />

      <div className="flex min-h-[300px] w-full max-w-[500px] flex-col items-start gap-7">
        <h3 className="text-start text-[34px] font-medium">
          Do you want to use this domain as your primary name?
        </h3>

        <div className="flex gap-3">
          <div
            className="cursor-pointer rounded-full border border-gray-200 px-5 py-3"
            onClick={() => handleDivClick(radioButtonRefYes)}
          >
            <RadioButton
              checked={asPrimaryName === true}
              onChange={() => {
                setAsPrimaryName(true);
              }}
              ref={radioButtonRefYes}
              label="Yes"
              name="RadioButtonGroup"
              value="10"
            />
          </div>
          <div
            className="cursor-pointer rounded-full border border-gray-200 px-5 py-3"
            onClick={() => handleDivClick(radioButtonRefNo)}
          >
            <RadioButton
              checked={asPrimaryName === false}
              onChange={() => {
                setAsPrimaryName(false);
              }}
              ref={radioButtonRefNo}
              label="No"
              name="RadioButtonGroup"
              value="10"
            />
          </div>
        </div>
      </div>
      <div className="flex w-full">
        <NextButton
          disabled={asPrimaryName === null}
          onClick={() => {
            saveAsPrimaryNameInLocalStorage();
            handleNextStep();
          }}
        />
      </div>
    </div>
  );
};
