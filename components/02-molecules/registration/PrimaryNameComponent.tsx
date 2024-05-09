"use client";

import BackButton from "@/components/01-atoms/BackButton";
import NextButton from "@/components/01-atoms/NextButton";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { RadioButton } from "@ensdomains/thorin";
import { useRef } from "react";

interface PrimaryNameComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export function PrimaryNameComponent({
  handlePreviousStep,
  handleNextStep,
}: PrimaryNameComponentProps) {
  const radioButtonRefYes = useRef(null);
  const radioButtonRefNo = useRef(null);

  const { nameRegistrationData, setIsPrimaryName } = useNameRegistration();

  const { isPrimaryName } = nameRegistrationData;

  const handleDivClick = (radioRef: React.RefObject<HTMLInputElement>) => {
    radioRef?.current?.click();
  };

  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />

      <div className="max-w-[500px] w-full flex items-start flex-col gap-7">
        <h3 className="text-start text-[34px] font-medium">
          Do you want to use this domain as your primary name?
        </h3>

        <div className="flex gap-3">
          <div
            className="cursor-pointer border border-gray-200 py-3 px-5 rounded-full"
            onClick={() => handleDivClick(radioButtonRefYes)}
          >
            <RadioButton
              checked={isPrimaryName}
              onChange={() => {
                setIsPrimaryName(true);
              }}
              ref={radioButtonRefYes}
              label="Yes"
              name="RadioButtonGroup"
              value="10"
            />
          </div>
          <div
            className="cursor-pointer border border-gray-200 py-3 px-5 rounded-full"
            onClick={() => handleDivClick(radioButtonRefNo)}
          >
            <RadioButton
              checked={isPrimaryName === false}
              onChange={() => {
                setIsPrimaryName(false);
              }}
              ref={radioButtonRefNo}
              label="No"
              name="RadioButtonGroup"
              value="10"
            />
          </div>
        </div>
      </div>

      <NextButton onClick={handleNextStep} />
    </div>
  );
}
