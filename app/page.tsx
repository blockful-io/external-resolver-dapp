"use client";

import { ChangeEvent, useState } from "react";
import { Button, CrossCircleSVG, Spinner, WalletSVG } from "@ensdomains/thorin";
import { Forms } from "../components/forms";

export default function Home() {
  const [domain, setDomain] = useState("");

  const clearDomainSearch = () => {
    setDomain("");
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
  };

  return (
    <main className="flex relative h-screen flex-col items-center justify-center bg-white p-4 overflow-clip">
      <Forms className="absolute w-full h-full px-6 pt-10" />

      <div className="w-full h-20  absolute top-0 left-0 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center justify-center gap-2.5">
          <div className=" h-6 w-6 bg-gradient-ens rounded-full" />
          <p className="text-[16px] font-bold text-black">DomainResolver</p>
        </div>
        <div>
          <Button
            size="small"
            colorStyle="blueSecondary"
            prefix={<WalletSVG />}
          >
            Connect
          </Button>
        </div>
      </div>

      <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-y-8 -translate-y-1/3">
        <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-gray-200">
          <p>🔎</p>
          <p className="text-black">Search domains</p>
        </div>
        <div className="text-center">
          <h1 className="font-medium text-[36px] pb-2 text-[#1E2122] leading-[48px]">
            Simplify your <span className="text-gradient-ens">web3 domain</span>{" "}
            registration
          </h1>
          <p className="text-gray-500 tex-[20px] font-normal">
            Type in your desired domain and see what&apos;s available.
          </p>
        </div>

        {/* Input  */}
        <div className="w-full h-[52px] relative max-w-[470px] ">
          <div className="absolute top-0 left-0 w-full border border-gray-200 rounded-xl">
            <div className="flex w-full justify-center items-center p-2 pl-5">
              <input
                value={domain}
                onChange={handleInputChange}
                className="w-full py-2 text-black"
                placeholder="Search for a domain"
              />

              <div className="flex items-center justify-center gap-2">
                {!!domain && (
                  <button
                    className="h-full p-2 hover:-translate-y-[1px] transition-all duration-200"
                    onClick={clearDomainSearch}
                  >
                    <CrossCircleSVG className="text-gray-400 h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div
              className={`transition-all duration-300 overflow-hidden ${
                domain
                  ? "opacity-100 visible h-[52px]"
                  : " opacity-0 invisible h-0"
              }`}
            >
              <div className="flex w-full justify-between items-center border-gray-200 border-t p-4 pl-5 ">
                <p className="text-gray-500">
                  {domain ? `${domain}.eth` : <span />}
                </p>

                <Spinner color="blue" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[85%] h-[243px] blur-[125px] bg-gradient-ens absolute bottom-[-200px] rounded-ellipse"></div>
    </main>
  );
}
