"use client"; // This is a client component 👈🏽

import { useState } from "react";
import {
  Button,
  MagnifyingGlassSimpleSVG,
  WalletSVG,
} from "@ensdomains/thorin";
import { Forms } from "./components/forms";

export default function Home() {
  const [domain, setDomain] = useState("");

  return (
    <main className="flex relative h-screen flex-col items-center justify-center bg-white p-4 overflow-clip">
      <Forms className="absolute w-full h-full px-6 pt-10" />

      <div className="w-full h-20  absolute top-0 left-0 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center justify-center gap-2.5">
          <div className=" h-6 w-6 bg-gradient-ens rounded-full" />
          <p className="text-[16px] font-bold">DomainResolver</p>
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
          <p>Search domains</p>
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

        <div className="flex w-full mt-5 justify-center items-center rounded-xl max-w-[570px] bg-white border border-gray-200 p-2 pl-5">
          <input className="w-full" placeholder="Search for a domain"></input>

          <div style={{ width: "180px" }}>
            <Button prefix={<MagnifyingGlassSimpleSVG />}>Search</Button>
          </div>
        </div>
      </div>
      <div className="w-[85%] h-[243px] blur-[125px] bg-gradient-ens absolute bottom-[-200px] rounded-ellipse"></div>
    </main>
  );
}
