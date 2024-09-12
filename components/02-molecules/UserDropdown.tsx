import {
  Dropdown,
  ExitSVG,
  PersonSVG,
  Skeleton,
  SkeletonGroup,
} from "@ensdomains/thorin";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useEnsName, usePublicClient } from "wagmi";
import toast from "react-hot-toast";

export const UserDropdown = () => {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address: address });

  const { disconnect } = useDisconnect();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const publicClient = usePublicClient();

  const router = useRouter();

  const getEnsAvatar = async () => {
    if (!publicClient) {
      toast.error("No public client found");
      return null;
    }

    setIsLoading(true);
    if (ensName) {
      const ensAvatar = await publicClient.getEnsAvatar({ name: ensName });
      if (ensAvatar) {
        setAvatarUrl(ensAvatar);
      } else {
        setAvatarUrl(
          "https://source.boringavatars.com/marble/120/Maria%20Mitchell?colors=44BCF0,7298F8,A099FF,FFFFFF"
        );
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getEnsAvatar();
  }, [ensName]);

  return (
    <Dropdown
      color="accentSecondary"
      width={200}
      items={[
        {
          label: "Manage",
          onClick: () => router.push(`/domains`),
          icon: <PersonSVG />,
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
            <Skeleton>
              <div className="h-6 w-6 bg-gradient-ens rounded-full overflow-hidden">
                <img src={avatarUrl} />
              </div>
            </Skeleton>

            <Skeleton>
              <p className="text-base font-bold text-white">
                {ensName && !isLoading
                  ? ensName
                  : address?.slice(0, 6) + "..." + address?.slice(-4)}
              </p>
            </Skeleton>
          </div>
        </SkeletonGroup>
      }
    />
  );
};
