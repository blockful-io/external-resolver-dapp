import {
  ArbitrumIcon,
  BackButton,
  DatabaseIcon,
  EthIcon,
  NextButton,
  OptimismIcon,
} from "@/components/01-atoms";
import { EnsResolver } from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import ExternalLinkIcon from "@/components/01-atoms/icons/external-link";
import { RadioButton, Typography } from "@ensdomains/thorin";
import { useEffect, useRef } from "react";

interface ENSResolverComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const ENSResolverComponent = ({
  handlePreviousStep,
  handleNextStep,
}: ENSResolverComponentProps) => {
  const radioButtonRefMainnet = useRef(null);
  const radioButtonRefDatabase = useRef(null);
  const radioButtonRefArbitrum = useRef(null);
  const radioButtonRefOptimism = useRef(null);

  const { nameRegistrationData, setEnsResolver } = useNameRegistration();

  const { ensResolver } = nameRegistrationData;

  const handleENSResolverSelection = (
    radioRef: React.RefObject<HTMLInputElement>
  ) => {
    radioRef?.current?.click();
  };

  useEffect(() => {
    setEnsResolver(EnsResolver.Database);
  }, []);

  return (
    <div className="flex flex-col gap-[44px] justify-start items-start">
      <BackButton onClick={handlePreviousStep} />

      <div className="max-w-[500px] w-full flex items-start flex-col gap-7">
        <div className="flex flex-col gap-3">
          <h3 className="text-start text-[34px] font-medium">
            Where do you want to store the domain data?
          </h3>
          <div className="flex gap-2">
            <Typography className="text-start" fontVariant="small">
              What are the differences?
            </Typography>
            <a
              target="_blank"
              href="https://docs.ens.domains/resolvers/quickstart"
              className="flex items-center justify-center gap-1"
            >
              <ExternalLinkIcon className="w-3 h-3" />
              <p className="text-blue-500 text-sm">Learn more</p>
            </a>
          </div>
        </div>

        <div className="flex flex-col border rounded-[8px] border-gray-200 w-full">
          {/* <div
            onClick={() => handleENSResolverSelection(radioButtonRefMainnet)}
            className={`flex cursor-pointer items-center gap-4 p-3 border-b border-gray-200 ${
              ensResolver === null
                ? "bg-white"
                : ensResolver === EnsResolver.Mainnet
                ? "bg-[#EEF5FF]"
                : "bg-white"
            }`}
          >
            <div>
              <RadioButton
                checked={ensResolver === EnsResolver.Mainnet}
                onChange={() => {
                  setEnsResolver(EnsResolver.Mainnet);
                }}
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
          </div> */}
          <div
            onClick={() => handleENSResolverSelection(radioButtonRefDatabase)}
            className={`flex cursor-pointer items-center gap-4 p-3 border-b border-gray-200 ${
              ensResolver === null
                ? "bg-white"
                : ensResolver === EnsResolver.Database
                ? "bg-[#EEF5FF]"
                : "bg-white"
            }`}
          >
            <div>
              <RadioButton
                checked={ensResolver === EnsResolver.Database}
                onChange={() => {
                  setEnsResolver(EnsResolver.Database);
                }}
                ref={radioButtonRefDatabase}
                label=""
                name="RadioButtonGroup"
                value="10"
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <DatabaseIcon className="h-6 w-6" />
              Off-chain
              <p className="text-xs mt-1">hosted by blockful</p>
            </div>
          </div>

          <button
            disabled={true}
            onClick={() => handleENSResolverSelection(radioButtonRefArbitrum)}
            className={`!bg-gray-100 flex grayscale cursor-pointer items-center gap-4 p-3 border-b border-gray-200 ${
              ensResolver === null
                ? "bg-white"
                : ensResolver === EnsResolver.Arbitrum
                ? "bg-[#EEF5FF]"
                : "bg-white"
            }`}
          >
            <div>
              <RadioButton
                checked={ensResolver === EnsResolver.Arbitrum}
                onChange={() => {
                  setEnsResolver(EnsResolver.Arbitrum);
                }}
                ref={radioButtonRefArbitrum}
                label=""
                name="RadioButtonGroup"
                value="10"
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <ArbitrumIcon className="h-6 w-6" />
              Arbitrum
              <span className="text-xs text-gray-500">Coming soon</span>
            </div>
          </button>

          <button
            disabled={true}
            onClick={() => handleENSResolverSelection(radioButtonRefOptimism)}
            className={`!bg-gray-100 grayscale flex cursor-pointer items-center gap-4 p-3 border-b border-gray-200 ${
              ensResolver === null
                ? "bg-white"
                : ensResolver === EnsResolver.Optimism
                ? "bg-[#EEF5FF]"
                : "bg-white"
            }`}
          >
            <div>
              <RadioButton
                checked={ensResolver === EnsResolver.Optimism}
                onChange={() => {
                  setEnsResolver(EnsResolver.Optimism);
                }}
                ref={radioButtonRefOptimism}
                label=""
                name="RadioButtonGroup"
                value="10"
              />
            </div>
            <div className="flex items-end justify-center gap-2">
              <OptimismIcon className="h-6 w-6" />
              Optimism
              <span className="text-xs text-gray-500">Coming soon</span>
            </div>
          </button>
        </div>
      </div>

      <NextButton disabled={ensResolver === null} onClick={handleNextStep} />
    </div>
  );
};
