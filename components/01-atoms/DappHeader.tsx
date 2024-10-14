import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { UserDropdown } from "@/components/02-molecules";
import { ConnectMetamask } from "./ConnectMetamask";
import { useRouter } from "next/router";
import { PlusCircleIcon } from "./icons/plus-circle-icon";
import { CogIcon } from "./icons/cog-icon";
import { HeaderLink } from "./HeaderLink";
import { TestnetBanner } from "./TestnetBanner";

export interface HeaderLinkInterface {
  icon: React.ElementType;
  label: string;
  href: string;
}

const links: HeaderLinkInterface[] = [
  {
    icon: PlusCircleIcon,
    label: "Register",
    href: "/",
  },
  {
    icon: CogIcon,
    label: "Manage",
    href: "/domains",
  },
];

export const DappHeader = () => {
  const { address, chain } = useAccount();
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();
  const currentRoute = router.pathname;

  const isConnectedToTestnet = () => chain?.testnet;

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isConnectedToTestnet() && <TestnetBanner />}
      <div className="z-50 flex h-20 w-full items-center justify-between bg-white px-6 shadow">
        <div className="mx-auto flex h-full w-full max-w-[1216px] items-center justify-between">
          <div className="flex h-full items-center gap-4">
            <Link href="/" className="flex items-center justify-center gap-2.5">
              <p className="text-2xl font-bold text-black">nameful</p>
            </Link>
            <div className="h-5 w-1 grow border-l border-gray-300" />
            <div className="flex h-full items-center">
              {links.map((link) => {
                return (
                  <HeaderLink
                    key={link.label}
                    isActive={currentRoute === link.href}
                    {...link}
                  />
                );
              })}
            </div>
          </div>

          <div>
            {isClient && address ? <UserDropdown /> : <ConnectMetamask />}
          </div>
        </div>
      </div>
    </>
  );
};
