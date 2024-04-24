"use client"; // This is a client component 👈🏽

import { useState } from "react";
import { Button, Input, MagnifyingGlassSimpleSVG } from "@ensdomains/thorin";

export default function Home() {
  const [domain, setDomain] = useState("");

  return (
    <main className="flex relative min-h-screen flex-col items-center justify-center bg-white p-4 overflow-clip">
      <div className="flex w-full max-w-6xl flex-col items-center justify-center space-y-8">
        <div className="text-center">
          <h1 className="font-medium text-[36px] pb-2 text-[#1E2122] leading-[48px]">
            Simplify your <span className="text-gradient-ens">web3 domain</span>{" "}
            registration
          </h1>
          <p className="text-gray-500 tex-[20px] font-normal">
            Type in your desired domain and see what&apos;s available.
          </p>
        </div>
        <div className="flex w-full justify-center items-center rounded-xl max-w-[570px] bg-white border border-gray-200 p-2 pl-5">
          <input className="w-full" placeholder="Search for a domain"></input>

          <div style={{ width: "180px" }}>
            <Button prefix={<MagnifyingGlassSimpleSVG />}>Search</Button>
          </div>
        </div>
        <div className="w-[85%] h-[243px] blur-[125px] bg-gradient-ens absolute bottom-[-200px] rounded-ellipse"></div>
      </div>
    </main>
  );
}
