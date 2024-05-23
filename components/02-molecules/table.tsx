import { ListUpSVG } from "@ensdomains/thorin";
import Image from "next/image";
import React from "react";

const Table = () => {
  const data = [
    {
      domain: "coolcats.eth",
      role: ["Owner", "Manager"],
      avatar: "/coolcat.avif",
    },
    {
      domain: "gh0stlygh0st.eth",
      role: ["Owner", "ETH record"],
      avatar: "/coolcat.avif",
    },
    {
      domain: "boredape.eth",
      role: ["Owner", "Manager", "ETH record"],
      avatar: "/coolcat.avif",
    },
    {
      domain: "theseklilies.eth",
      role: ["Manager", "ETH record"],
      avatar: "/coolcat.avif",
    },
  ];

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
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              <td className="py-2 px-4 border-b align-middle cursor-pointer">
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

export default Table;
