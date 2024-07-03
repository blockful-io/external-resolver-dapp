import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import { normalize } from "viem/ens";

import CustomImage from "./CustomImage";
import Avatar from "boring-avatars";
import {
  ensPublicClient,
  publicClient,
  walletClient,
} from "@/lib/wallet/wallet-config";
import { Skeleton } from "@ensdomains/thorin";
import { walletActions } from "viem";

interface TableItemProps {
  domain: string;
  roles: string[];
}

export const TableItem = ({ domain, roles }: TableItemProps) => {
  const router = useRouter();
  const [avatar, setAvatar] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  // console.log(domain);

  const handleRowClick = (href: string) => {
    router.push(href);
  };

  useEffect(() => {
    const geteEnsAvatar = async () => {
      setIsLoadingImage(true);
      let ensAvatar = await publicClient.getEnsAvatar({
        name: normalize(domain),
      });
      ensAvatar && setAvatar(ensAvatar);
      setIsLoadingImage(false);
    };

    geteEnsAvatar();
  }, []);

  return (
    <tr
      onClick={() => handleRowClick(`/domains/${domain}`)}
      className="hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
    >
      <td className="py-2 px-4 border-b align-middle">
        <div className="flex items-center gap-2">
          <Skeleton loading={isLoadingImage}>
            {avatar ? (
              <CustomImage
                alt="avatar image"
                width={100}
                height={100}
                src={
                  !!avatar
                    ? avatar
                    : "https://source.boringavatars.com/marble/120/Maria%20Mitchell?colors=264653,2a9d8f,e9c46a,f4a261,e76f51"
                }
                className="w-[40px] h-[40px] border-4 border-white rounded-[10px]"
              />
            ) : (
              <div className="w-[40px] h-[40px] border-4 bg-gradient-ens border-white rounded-[10px] overflow-hidden">
                <Avatar
                  size={40}
                  square
                  name="Margaret Bourke"
                  variant="beam"
                  colors={["#AAAAAA", "#3DDE74", "#000000", "#FFFFFF"]}
                />
              </div>
            )}
          </Skeleton>
          <span className="text-blue-600">{domain}</span>
        </div>
      </td>
      <td className="py-2 px-4 border-b align-middle">
        {roles.map((role, index) => (
          <span
            key={index}
            className={`inline-block px-2 py-1 mr-2 rounded ${
              role === "owner"
                ? "bg-yellow-100 text-yellow-800"
                : role === "manager"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {role}
          </span>
        ))}
      </td>
    </tr>
  );
};
