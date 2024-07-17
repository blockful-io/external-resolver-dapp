import {
  Dropdown,
  ExitSVG,
  PersonSVG,
  Skeleton,
  SkeletonGroup,
} from "@ensdomains/thorin";
import { normalize } from "viem/ens";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";

export const UserDropdown = () => {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address: address });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ? normalize(ensName) : "",
  });

  const { disconnect } = useDisconnect();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!ensAvatar) {
      setAvatarUrl(
        "https://source.boringavatars.com/marble/120/Maria%20Mitchell?colors=44BCF0,7298F8,A099FF,FFFFFF"
      );
    }
  }, [ensAvatar]);

  useEffect(() => {
    if (!avatarUrl) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [ensName]);

  return (
    <Dropdown
      color="accentSecondary"
      width={200}
      items={[
        {
          label: "Manage",
          onClick: () => router.push(`/domains/${ensName}`),
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
            <div className="h-6 w-6 bg-gradient-ens rounded-full overflow-hidden">
              <Skeleton>
                <img src={avatarUrl} />
              </Skeleton>
            </div>

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
