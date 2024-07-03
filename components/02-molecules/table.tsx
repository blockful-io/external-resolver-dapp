import { publicClient } from "@/lib/wallet/wallet-config";
import { ListUpSVG } from "@ensdomains/thorin";
import Image from "next/image";
import { useRouter } from "next/navigation";

import React from "react";
import { normalize } from "viem/ens";
import { TableItem } from "./TableItem";

interface TableProps {
  names: (string | null)[];
}

export const Table = ({ names }: TableProps) => {
  const router = useRouter();

  const handleRowClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-4 px-4 border-b text-left font-normal">
              <div className="flex gap-2 items-center">
                Domain <ListUpSVG className="text-blue-500" />
              </div>
            </th>
            <th className="py-4 px-4 border-b text-left font-normal">
              Your role
            </th>
          </tr>
        </thead>
        <tbody>
          {names.map((item, index) => {
            return (
              item && (
                <TableItem key={index} domain={item} roles={["manager"]} />
              )
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
