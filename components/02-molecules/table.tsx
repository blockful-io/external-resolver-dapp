import { ListUpSVG } from "@ensdomains/thorin";
import Image from "next/image";
import { useRouter } from "next/navigation";

import React from "react";

export const Table = () => {
  const router = useRouter();

  const data = [
    {
      domain: "alextnetto.eth",
      role: ["Owner", "Manager"],
      avatar: "/coolcat.avif",
    },
    {
      domain: "frankind.eth",
      role: ["Owner", "ETH record"],
      avatar: "/coolcat.avif",
    },
    {
      domain: "edulennert.eth",
      role: ["Owner", "Manager", "ETH record"],
      avatar: "/coolcat.avif",
    },
    {
      domain: "pikonha.eth",
      role: ["Manager", "ETH record"],
      avatar: "/coolcat.avif",
    },
    {
      domain: "leo.eth",
      role: ["Manager", "ETH record"],
      avatar: "/coolcat.avif",
    },
  ];

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
          {data.map((item, index) => (
            <tr
              key={index}
              onClick={() => handleRowClick(`/domains/${item.domain}`)}
              className="hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
            >
              <td className="py-2 px-4 border-b align-middle">
                <div className="flex items-center">
                  <Image
                    width={32}
                    height={32}
                    src={item.avatar}
                    alt={item.domain}
                    className="w-8 h-8 rounded-full mr-4"
                  />
                  <span className="text-blue-600">{item.domain}</span>
                </div>
              </td>
              <td className="py-2 px-4 border-b align-middle">
                {item.role.map((role, index) => (
                  <span
                    key={index}
                    className={`inline-block px-2 py-1 mr-2 rounded ${
                      role === "Owner"
                        ? "bg-yellow-100 text-yellow-800"
                        : role === "Manager"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {role}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
