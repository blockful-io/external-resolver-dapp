"use client";

import { Typography } from "@ensdomains/thorin";
import CartIcon from "../01-atoms/icons/cart-icon";
import InfoCircleIcon from "../01-atoms/icons/info-circle";
import { useState } from "react";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";

interface CurrencyData {
  currency: "usd" | "eth";
}

const Currency: Record<string, CurrencyData["currency"]> = {
  usd: "usd",
  eth: "eth",
};

export default function RegistrationSummary() {
  const [currency, setCurrency] = useState<CurrencyData["currency"]>(
    Currency.usd
  );

  const { nameRegistrationData } = useNameRegistration();

  console.log(nameRegistrationData);
  return (
    <div className="w-[474px] border border-gray-200 rounded-[12px] flex flex-col overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex flex-col items-start gap-6">
        <Typography fontVariant="extraLarge">Registration summary</Typography>
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-200">
            <CartIcon className="h-5 w-5" />
          </div>
          <Typography fontVariant="largeBold" color="green">
            isadoranunes.eth
          </Typography>
        </div>
      </div>
      <div className="p-6 flex flex-col gap-5 border-b border-gray-200">
        <div className="flex w-full justify-between items-center">
          <div className="px-4 py-3 bg-gray-50 rounded-[8px] gap-2 flex items-center justify-center border-gray-200 border">
            <InfoCircleIcon />
            <div>
              <p className="text-gray-400 text-sm font-semibold">65 gwei</p>
            </div>
          </div>
          <div
            className={`p-1 border border-gray-200 font-semibold bg-gray-50 flex items-center justify-center rounded-[12px] `}
          >
            <div
              className={`cursor-pointer py-2 px-3 font-semibold rounded-[8px] transition-colors duration-200 ${
                currency === Currency.usd
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 bg-gray-50"
              }`}
              onClick={() => {
                setCurrency(Currency.usd);
              }}
            >
              USD
            </div>
            <div
              className={`cursor-pointer py-2 px-3 font-semibold rounded-[8px] transition-colors duration-200 ${
                currency === Currency.eth
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 bg-gray-50"
              }`}
              onClick={() => {
                setCurrency(Currency.eth);
              }}
            >
              ETH
            </div>
          </div>
        </div>
        <div className="flex w-full justify-between items-center">
          <p>1 year registration</p>
          <div>$5.00</div>
        </div>
        <div className="flex w-full justify-between items-center">
          <p>Estimated network fee</p>
          <div>$66.29</div>
        </div>
      </div>
      <div className="p-6 bg-gray-50">
        <div className="w-full flex justify-between items-center">
          <Typography fontVariant="bodyBold">Estimated total</Typography>
          <Typography fontVariant="bodyBold">$72.29</Typography>
        </div>
      </div>
    </div>
  );
}
