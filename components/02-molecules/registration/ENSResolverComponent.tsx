"use client";

import BackButton from "@/components/01-atoms/BackButton";
import NextButton from "@/components/01-atoms/NextButton";
import ArbitrumIcon from "@/components/01-atoms/icons/arbitrum";
import DatabaseIcon from "@/components/01-atoms/icons/database";
import EthIcon from "@/components/01-atoms/icons/eth";
import OptimismIcon from "@/components/01-atoms/icons/optimism";
import { RadioButton, Typography } from "@ensdomains/thorin";
import { useRef } from "react";

interface ENSResolverComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export default function ENSResolverComponent({
  handlePreviousStep,
  handleNextStep,
}: ENSResolverComponentProps) {
  const radioButtonRefMainnet = useRef(null);
  const radioButtonRefDatabase = useRef(null);
  const radioButtonRefArbitrum = useRef(null);
  const radioButtonRefOptimism = useRef(null);

  const handleDivClick = (radioRef: React.RefObject<HTMLInputElement>) => {
    radioRef?.current?.click();
  };
  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />

      <div className="max-w-[500px] w-full flex items-start flex-col gap-7">
        <h3 className="text-start text-[34px] font-medium">
          Where do you want to store the domain data?
        </h3>
        <Typography className="text-start" fontVariant="small">
          What are the differences?
        </Typography>
        <div className="flex flex-col border rounded-[8px] border-gray-200 w-full">
          <div
            onClick={() => handleDivClick(radioButtonRefMainnet)}
            className="flex cursor-pointer items-center gap-4 p-3 border-b border-gray-200"
          >
            <div>
              <RadioButton
                ref={radioButtonRefMainnet}
                label=""
                name="RadioButtonGroup"
                value="10"
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <EthIcon className="h-6 w-6" />
              Mainnet
            </div>
          </div>
          <div
            onClick={() => handleDivClick(radioButtonRefDatabase)}
            className="flex cursor-pointer items-center gap-4 p-3 border-b border-gray-200"
          >
            <div>
              <RadioButton
                ref={radioButtonRefDatabase}
                label=""
                name="RadioButtonGroup"
                value="10"
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <DatabaseIcon className="h-6 w-6" />
              Centralized Database
            </div>
          </div>

          <div
            onClick={() => handleDivClick(radioButtonRefArbitrum)}
            className="flex cursor-pointer items-center gap-4 p-3 border-b border-gray-200"
          >
            <div>
              <RadioButton
                ref={radioButtonRefArbitrum}
                label=""
                name="RadioButtonGroup"
                value="10"
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <ArbitrumIcon className="h-6 w-6" />
              Arbitrum
            </div>
          </div>

          <div
            onClick={() => handleDivClick(radioButtonRefOptimism)}
            className="flex cursor-pointer items-center gap-4 p-3"
          >
            <div>
              <RadioButton
                ref={radioButtonRefOptimism}
                label=""
                name="RadioButtonGroup"
                value="10"
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <OptimismIcon className="h-6 w-6" />
              Optimism
            </div>
          </div>
        </div>
      </div>

      <NextButton onClick={handleNextStep} />
    </div>
  );
}
