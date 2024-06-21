/* eslint-disable react-hooks/exhaustive-deps */
import { Tag, Typography } from "@ensdomains/thorin";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import {
  CartIcon,
  EnsResolverTag,
  EthIcon,
  InfoCircleIcon,
} from "@/components/01-atoms";
import {
  getGasPrice,
  getNamePrice,
  getNameRegistrationGasEstimate,
} from "@/lib/name-registration/blockchain-txs";
import { useEffect, useState } from "react";
import { formatEther } from "viem";

export const RegistrationSummary = () => {
  const {
    nameRegistrationData,
    setNamePrice,
    setEstimatedNetworkFee,
    setRegistrationPrice,
  } = useNameRegistration();

  const {
    registrationYears,
    asPrimaryName,
    ensResolver,
    name,
    namePrice,
    registrationPrice,
    estimatedNetworkFee,
  } = nameRegistrationData;

  useEffect(() => {
    if (!name) return;

    getNamePrice({
      ensName: name,
      durationInYears: BigInt(registrationYears),
    }).then((price) => {
      setNamePrice(price);
    });
  }, [name, registrationYears]);

  const [gasPriceInGWei, setGasPriceInGWei] = useState<string>("");

  useEffect(() => {
    getGasPrice().then((gasPrice) => {
      setGasPriceInGWei(formatEther(gasPrice, "gwei"));

      const estimate = getNameRegistrationGasEstimate();

      setEstimatedNetworkFee(BigInt(gasPrice) * BigInt(estimate));
    });

    setInterval(() => {
      getGasPrice().then((gasPrice) => {
        setGasPriceInGWei(formatEther(gasPrice, "gwei"));

        const estimate = getNameRegistrationGasEstimate();

        setEstimatedNetworkFee(BigInt(gasPrice) * BigInt(estimate));
      });
    }, 20000);
  }, []);

  useEffect(() => {
    if (!namePrice || !estimatedNetworkFee) return;

    setRegistrationPrice(estimatedNetworkFee + namePrice);
  }, [estimatedNetworkFee, namePrice]);

  const displayPrice = (price: bigint) => {
    const reducedLength = formatEther(price).slice(0, 5);
    const isTooLow = reducedLength === "0.000";
    return isTooLow ? "less than 0.001" : reducedLength;
  };

  return (
    <div className="w-[474px] border border-gray-200 rounded-xl flex flex-col overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex flex-col items-start gap-6">
        <Typography fontVariant="extraLarge">Registration summary</Typography>
        <div className="w-full flex justify-between items-center">
          <div className="flex gap-4 items-center w-full">
            <div className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-200">
              <CartIcon className="h-5 w-5" />
            </div>
            <div className="flex-grow flex-col gap-1 space-y-1">
              <div className="flex justify-between items-center w-full">
                <Typography
                  fontVariant="largeBold"
                  color="green"
                  className={
                    "truncate " +
                    (asPrimaryName ? "max-w-[240px]" : "max-w-[340px]")
                  }
                >
                  {name?.displayName}
                </Typography>
                {asPrimaryName && (
                  <Tag colorStyle="greenSecondary">Primary name</Tag>
                )}
              </div>

              {ensResolver && <EnsResolverTag ensResolver={ensResolver} />}
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 flex flex-col gap-5 border-b border-gray-200">
        <div className="flex w-full justify-start items-center">
          <div className="px-4 py-3 bg-gray-50 rounded-lg gap-2 flex items-center justify-center border-gray-200 border">
            <InfoCircleIcon />
            <div>
              <p className="text-gray-400 text-sm font-semibold">
                {gasPriceInGWei.slice(0, 5)} gwei
              </p>
            </div>
          </div>
          {/* <CurrencyToggle /> */}
        </div>
        <div className="flex w-full justify-between items-center">
          <p>
            {registrationYears} year{registrationYears > 1 && "s"} registration
          </p>
          {namePrice ? (
            <div className="flex space-x-1 items-center">
              <p>{displayPrice(namePrice)}</p>
              <EthIcon className="h-4 w-4" />
            </div>
          ) : (
            <div className="w-20 rounded-lg bg-gray-200 animate-pulse h-4"></div>
          )}
        </div>
        <div className="flex w-full justify-between items-center">
          <p>Estimated network fee</p>
          {estimatedNetworkFee ? (
            <div className="flex space-x-1 items-center">
              <p>{displayPrice(estimatedNetworkFee)}</p>
              <EthIcon className="h-4 w-4" />
            </div>
          ) : (
            <div className="w-20 rounded-lg bg-gray-200 animate-pulse h-4"></div>
          )}
        </div>
      </div>
      <div className="p-6 bg-gray-50">
        <div className="w-full flex justify-between items-center">
          <Typography fontVariant="bodyBold">Estimated total</Typography>
          {registrationPrice ? (
            <div className="flex space-x-1 items-center">
              <Typography fontVariant="bodyBold">
                {displayPrice(registrationPrice)}
              </Typography>
              <EthIcon className="h-4 w-4" />
            </div>
          ) : (
            <div className="w-40 rounded-lg bg-gray-200 animate-pulse h-4"></div>
          )}
        </div>
      </div>
    </div>
  );
};
