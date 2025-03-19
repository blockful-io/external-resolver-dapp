/* eslint-disable react-hooks/exhaustive-deps */
import { Tag, Typography } from "@ensdomains/thorin";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import {
  CartIcon,
  EnsResolverTag,
  EthIcon,
  InfoCircleIcon,
} from "@/components/atoms";
import {
  getGasPrice,
  getNamePrice,
  getNameRegistrationGasEstimate,
} from "@/lib/utils/blockchain-txs";
import { useEffect, useState } from "react";
import { formatEther, PublicClient } from "viem";
import { usePublicClient } from "wagmi";
import { ClientWithEns } from "ensjs-monorepo/packages/ensjs/src/contracts/consts";

export const RegistrationSummary = () => {
  const {
    nameRegistrationData,
    setNamePrice,
    setEstimatedNetworkFee,
    setRegistrationPrice,
  } = useNameRegistration();

  const publicClient = usePublicClient() as PublicClient & ClientWithEns;

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

    if (!publicClient) return;

    getNamePrice({
      ensName: name,
      durationInYears: BigInt(registrationYears),
      publicClient: publicClient,
    }).then((price) => {
      setNamePrice(price);
    });
  }, [name, registrationYears]);

  const [gasPriceInGWei, setGasPriceInGWei] = useState<string>("");

  useEffect(() => {
    getGasPrice({ publicClient: publicClient }).then((gasPrice) => {
      setGasPriceInGWei(formatEther(gasPrice, "gwei"));

      const estimate = getNameRegistrationGasEstimate();

      setEstimatedNetworkFee(BigInt(gasPrice) * BigInt(estimate));
    });

    setInterval(() => {
      getGasPrice({ publicClient: publicClient }).then((gasPrice) => {
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
    <div className="flex w-[474px] flex-col overflow-hidden rounded-xl border border-gray-200">
      <div className="flex flex-col items-start gap-6 border-b border-gray-200 p-6">
        <Typography fontVariant="extraLarge">Registration summary</Typography>
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200">
              <CartIcon className="h-5 w-5" />
            </div>
            <div className="flex-grow flex-col gap-1 space-y-1">
              <div className="flex w-full items-center justify-between">
                <Typography
                  fontVariant="largeBold"
                  color="green"
                  className={
                    "truncate " +
                    (asPrimaryName ? "max-w-[240px]" : "max-w-[340px]")
                  }
                >
                  {name?.displayName.includes(".eth")
                    ? name.displayName
                    : `${name?.displayName}.eth`}
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
      <div className="flex flex-col gap-5 border-b border-gray-200 p-6">
        <div className="flex w-full items-center justify-start">
          <div className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <InfoCircleIcon />
            <div>
              <p className="text-sm font-semibold text-gray-400">
                {gasPriceInGWei.slice(0, 5)} gwei
              </p>
            </div>
          </div>
          {/* <CurrencyToggle /> */}
        </div>
        <div className="flex w-full items-center justify-between">
          <p>
            {registrationYears} year{registrationYears > 1 && "s"} registration
          </p>
          {namePrice ? (
            <div className="flex items-center space-x-1">
              <p>{displayPrice(namePrice)}</p>
              <EthIcon className="h-4 w-4" />
            </div>
          ) : (
            <div className="h-4 w-20 animate-pulse rounded-lg bg-gray-200"></div>
          )}
        </div>
        <div className="flex w-full items-center justify-between">
          <p>Estimated network fee</p>
          {estimatedNetworkFee ? (
            <div className="flex items-center space-x-1">
              <p>{displayPrice(estimatedNetworkFee)}</p>
              <EthIcon className="h-4 w-4" />
            </div>
          ) : (
            <div className="h-4 w-20 animate-pulse rounded-lg bg-gray-200"></div>
          )}
        </div>
      </div>
      <div className="bg-gray-50 p-6">
        <div className="flex w-full items-center justify-between">
          <Typography fontVariant="bodyBold">Estimated total</Typography>
          {registrationPrice ? (
            <div className="flex items-center space-x-1">
              <Typography fontVariant="bodyBold">
                {displayPrice(registrationPrice)}
              </Typography>
              <EthIcon className="h-4 w-4" />
            </div>
          ) : (
            <div className="h-4 w-40 animate-pulse rounded-lg bg-gray-200"></div>
          )}
        </div>
      </div>
    </div>
  );
};
