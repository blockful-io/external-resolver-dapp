import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { UserDropdown } from "@/components/02-molecules";
import { ConnectMetamask } from "./ConnectMetamask";
import { useRouter } from "next/router";
import { PlusCircleIcon } from "./icons/plus-circle-icon";
import { CogIcon } from "./icons/cog-icon";
import { HeaderLink } from "./HeaderLink";
import { sepolia } from "viem/chains";
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

  const isConnectedToTestnet = () => {
    return !!chain && chain.id === sepolia.id;
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isConnectedToTestnet() && <TestnetBanner />}
      <div className="w-full h-20 bg-white px-6 flex justify-between items-center shadow z-50">
        <div className="w-full max-w-[1216px] flex justify-between items-center mx-auto h-full">
          <div className="flex items-center h-full gap-4">
            <Link href="/" className="flex items-center justify-center gap-2.5">
              <p className="text-2xl font-bold text-black">nameful</p>
            </Link>
            <div className="w-1 h-5 grow border-l border-gray-300" />
            <div className="flex items-center h-full">
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
