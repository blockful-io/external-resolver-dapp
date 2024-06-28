import { useUser } from "@/lib/wallet/useUser";
import {
  Dropdown,
  ExitSVG,
  PersonActiveSVG,
  Skeleton,
  SkeletonGroup,
} from "@ensdomains/thorin";
import { normalize } from "viem/ens";
import { useEffect, useState } from "react";
import { useDisconnect } from "wagmi";
import { publicClient } from "@/lib/wallet/wallet-config";
import { useRouter } from "next/router";

export const UserDropdown = () => {
  const { authedUser } = useUser();
  const { disconnect } = useDisconnect();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [authedUserDomain, setAuthedUserDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchEnsAvatar = async () => {
      setIsLoading(true);
      try {
        if (authedUser) {
          const ensName = await publicClient.getEnsName({
            address: authedUser,
          });

          if (ensName) {
            setAuthedUserDomain(ensName);
            const result = await publicClient.getEnsAvatar({
              name: normalize(ensName),
            });

            if (typeof result !== "string") {
              throw new Error("ENS avatar is not a string");
            }

            setAvatarUrl(result);
          } else {
            console.error("ENS name does not exist");
          }
        } else {
          setAvatarUrl("https://source.boringavatars.com/");
        }
      } catch (error) {
        console.error("Error fetching ENS avatar:", error);
      }
      setIsLoading(false);
    };

    fetchEnsAvatar();
  }, [authedUser]);

  return (
    <Dropdown
      color="accentSecondary"
      width={200}
      items={[
        {
          label: "Settings",
          onClick: () => router.push(`/domains/${authedUserDomain}`),
          color: "text",
          icon: <PersonActiveSVG />,
        },
        {
          label: "Disconnect",
          onClick: () => disconnect(),
          color: "red",
          icon: <ExitSVG />,
        },
      ]}
      label={
        <SkeletonGroup loading={isLoading}>
          <div className="flex whitespace-nowrap items-center justify-center gap-2.5 rounded-full w-full">
            <div className="h-6 w-6 bg-gradient-ens rounded-full overflow-hidden">
              <Skeleton>
                <img src={avatarUrl} />
              </Skeleton>
            </div>

            <Skeleton>
              <p className="text-base font-bold text-white">
                {authedUserDomain && !isLoading
                  ? authedUserDomain
                  : authedUser?.slice(0, 6) + "..." + authedUser?.slice(-4)}
              </p>
            </Skeleton>
          </div>
        </SkeletonGroup>
      }
    />
  );
};
