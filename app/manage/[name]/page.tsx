"use client";

import Table from "@/components/02-molecules/table";
import { LeftChevronSVG } from "@ensdomains/thorin";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function RegisterNamePage() {
  const params = useParams();
  const name = params.name;

  return (
    <div className="text-black flex h-full flex-col items-center justify-start bg-white">
      <div className="w-full h-[200px] bg-gradient-ens py-10 px-[60px] flex items-start">
        <div className="w-full max-w-[1216px] flex mx-auto">
          <Link
            href="/manage"
            className="flex items-center justify-center flex-shrink text-white gap-2"
          >
            <LeftChevronSVG /> <p>Back to black</p>
          </Link>
        </div>
      </div>
      <div className="w-full relative max-w-[1216px] m-auo">
        <div className="w-[100px] h-[100px] bg-purple-500 absolute left-0 -translate-y-1/2 border-4 border-white rounded-[10px]"></div>
      </div>
      <div className="w-full px-[60px] border-b border-gray-200">
        <div className="w-full max-w-[1216px] mx-auto flex flex-col gap-7">
          <div className="h-[50px] w-full" />
          <div className="flex flex-col gap-1">
            <div className="text-[26px]">{name}</div>
            <p className="text-[16px] text-gray-400">
              Cool Cats is a collection of 9,999 randomly generated and
              stylistically curated NFTs.
            </p>
          </div>
          <div className="w-full flex translate-y-[1px]">
            <button className="flex p-4 border-b border-blue-500 text-blue-500 font-semibold hover:bg-gray-50 transition-colors duration-200">
              Profile
            </button>
            <button className="flex p-4 border-b text-gray-400 hover:bg-gray-50 transition-colors duration-200">
              Subdomains
            </button>
          </div>
        </div>
      </div>
      <div className="w-full max-w-[1216px] py-10">
        <Table />
      </div>
    </div>
  );
}
