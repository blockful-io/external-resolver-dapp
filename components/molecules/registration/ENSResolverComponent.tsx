import {
  ArbitrumIcon,
  BackButton,
  DatabaseIcon,
  NextButton,
  OptimismIcon,
} from "@/components/atoms";
import { EnsResolver } from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import ExternalLinkIcon from "@/components/atoms/icons/external-link";
import { Input, RadioButton, Typography } from "@ensdomains/thorin";
import { useEffect, useRef, useState } from "react";
import { isAddress, Address } from "viem";
import { useAccount } from "wagmi";
import { setNameRegistrationInLocalStorage } from "@/lib/name-registration/localStorage";

interface ENSResolverComponentProps {
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

export const ENSResolverComponent = ({
  handlePreviousStep,
  handleNextStep,
}: ENSResolverComponentProps) => {
  const radioButtonRefDatabase = useRef(null);
  const radioButtonRefCustomDatabase = useRef(null);
  const radioButtonRefArbitrum = useRef(null);
  const radioButtonRefOptimism = useRef(null);
  const [customAddress, setCustomAddress] = useState("");

  const { nameRegistrationData, setEnsResolver, setCustomResolverAddress } =
    useNameRegistration();

  const { address } = useAccount();

  const { ensResolver } = nameRegistrationData;

  const handleENSResolverSelection = (
    radioRef: React.RefObject<HTMLInputElement>,
  ) => {
    radioRef?.current?.click();
  };

  useEffect(() => {
    setEnsResolver(EnsResolver.Database);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveEnsResolverInLocalStorage = () => {
    if (address && nameRegistrationData.name) {
      setNameRegistrationInLocalStorage(address, nameRegistrationData.name, {
        ensResolver,
      });
    }
  };

  return (
    <div className="flex flex-col items-start justify-start gap-[44px]">
      <BackButton onClick={handlePreviousStep} />
      <div className="flex min-h-[300px] w-full max-w-[500px] flex-col items-start gap-7">
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
              <ExternalLinkIcon className="h-3 w-3" />
              <p className="text-sm text-blue-500">Learn more</p>
            </a>
          </div>
        </div>

        <div className="flex w-full flex-col rounded-[8px] border border-gray-200">
          <div
            onClick={() => handleENSResolverSelection(radioButtonRefDatabase)}
            className={`flex cursor-pointer items-center gap-4 border-b border-gray-200 p-3 ${
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
              <p className="mt-1 text-xs">hosted by blockful</p>
            </div>
          </div>

          <div
            onClick={() =>
              handleENSResolverSelection(radioButtonRefCustomDatabase)
            }
            className={`flex cursor-pointer items-center gap-4 border-b border-gray-200 p-3 ${
              ensResolver === null
                ? "bg-white"
                : ensResolver === EnsResolver.Custom
                  ? "bg-[#EEF5FF]"
                  : "bg-white"
            }`}
          >
            <div>
              <RadioButton
                checked={ensResolver === EnsResolver.Custom}
                onChange={() => {
                  setEnsResolver(EnsResolver.Custom);
                }}
                ref={radioButtonRefCustomDatabase}
                label=""
                name="RadioButtonGroup"
                value="10"
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <DatabaseIcon className="h-6 w-6" />
              Custom Resolver
            </div>
          </div>

          <button
            disabled={true}
            onClick={() => handleENSResolverSelection(radioButtonRefArbitrum)}
            className={`flex cursor-pointer items-center gap-4 border-b border-gray-200 !bg-gray-100 p-3 grayscale ${
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
            className={`flex cursor-pointer items-center gap-4 border-b border-gray-200 !bg-gray-100 p-3 grayscale ${
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
      {ensResolver === EnsResolver.Custom && (
        <Input
          clearable
          label={
            <span className="flex w-full justify-start">Ens Resolver</span>
          }
          placeholder="Resolver address"
          type="text"
          className="!flex !items-start !justify-start"
          value={customAddress}
          error={customAddress && !isAddress(customAddress)}
          onChange={(e) => {
            setCustomAddress(e.target.value);
          }}
        />
      )}
      <div className="flex w-full">
        <NextButton
          disabled={
            ensResolver === null ||
            (ensResolver === EnsResolver.Custom && !isAddress(customAddress))
          }
          onClick={() => {
            setCustomResolverAddress(customAddress as Address);
            saveEnsResolverInLocalStorage();
            handleNextStep();
          }}
        />
      </div>
    </div>
  );
};
