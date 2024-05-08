"use client";

import BackButton from "@/components/01-atoms/BackButton";
import NextButton from "@/components/01-atoms/NextButton";
import { RadioButton, Typography } from "@ensdomains/thorin";
import { useRef } from "react";

interface PrimaryNameComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export default function PrimaryNameComponent({
  handlePreviousStep,
  handleNextStep,
}: PrimaryNameComponentProps) {
  const radioButtonRefYes = useRef(null);
  const radioButtonRefNo = useRef(null);

  const handleDivClick = (radioRef: React.RefObject<HTMLInputElement>) => {
    radioRef?.current?.click();
  };

  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />

      <div className="max-w-[500px] w-full flex items-start flex-col gap-7">
        <Typography className="text-start" fontVariant="extraLargeBold">
          Do you want to use this domain as your primary name?
        </Typography>

        <div className="flex gap-3">
          <div
            className="cursor-pointer border border-gray-200 py-3 px-5 rounded-full"
            onClick={() => handleDivClick(radioButtonRefYes)}
          >
            <RadioButton
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
