import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import { normalize } from "viem/ens";

import CustomImage from "./CustomImage";
import Avatar from "boring-avatars";
import { Skeleton } from "@ensdomains/thorin";
import cc from "classcat";
import { usePublicClient } from "wagmi";

interface TableItemProps {
  domain: string;
  roles: string[];
  withRoleColumn: boolean;
  clickable: boolean;
}

export const TableItem = ({
  domain,
  roles,
  withRoleColumn,
  clickable,
}: TableItemProps) => {
  const router = useRouter();
  const [avatar, setAvatar] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  const publicClient = usePublicClient();

  const handleRowClick = (href: string) => {
    router.push(href);
  };

  useEffect(() => {
    let normalizedName = "";

    if (!publicClient) {
      return;
    }

    try {
      normalizedName = normalize(domain);

      const getEnsAvatar = async () => {
        setIsLoadingImage(true);
        const ensAvatar = await publicClient.getEnsAvatar({
          name: normalizedName,
        });
        ensAvatar && setAvatar(ensAvatar);
        setIsLoadingImage(false);
      };

      getEnsAvatar();
    } catch (e) {
      setIsLoadingImage(false);
    }
  }, []);

  return (
    <tr
      onClick={() => {
        clickable && handleRowClick(`/domains/${domain}`);
      }}
      className={cc([
        "transition-colors duration-200",
        { "cursor-pointer hover:bg-gray-100": clickable },
      ])}
    >
      <td className="border-b px-4 py-2 align-middle">
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
                    : "https://source.boringavatars.com/marble/120/Maria%20Mitchell?colors=44BCF0,7298F8,A099FF,FFFFFF"
                }
                className="h-10 w-10 rounded-[10px]"
              />
            ) : (
              <div className="h-10 w-10 overflow-hidden rounded-[10px] bg-gradient-ens">
                <Avatar
                  size={40}
                  square
                  name="Margaret Bourke"
                  variant="marble"
                  colors={["#44BCF0", "#7298F8", "#A099FF", "#FFFFFF"]}
                />
              </div>
            )}
          </Skeleton>
          <span className="text-blue-600">{domain}</span>
        </div>
      </td>
      {withRoleColumn && (
        <td className="border-b px-4 py-2 align-middle">
          {roles.map((role, index) => (
            <span
              key={index}
              className={cc([
                "mr-2 inline-block rounded px-2 py-1",
                {
                  "bg-yellow-100 text-yellow-800": role === "owner",
                  "bg-green-100 text-green-800": role === "manager",
                  "bg-blue-100 text-blue-800": role === "admin",
                },
              ])}
            >
              {role}
            </span>
          ))}
        </td>
      )}
    </tr>
  );
};
