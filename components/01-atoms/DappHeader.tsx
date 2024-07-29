import Link from "next/link";
import { useAccount, useSwitchChain } from "wagmi";
import { useEffect, useState } from "react";
import { DEFAULT_CHAIN_ID } from "@/lib/wallet/chains";
import { UserDropdown } from "@/components/02-molecules";
import { ConnectMetamask } from "./ConnectMetamask";
import { PlusCircleIcon } from "./icons/plus-circle-icon";
import cc from "classcat";
import { isAction } from "redux";

export const DappHeader = () => {
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (chain?.id !== DEFAULT_CHAIN_ID) {
      switchChain({ chainId: DEFAULT_CHAIN_ID });
    }
  }, [chain]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="w-full h-20 bg-white px-6 flex justify-between items-center shadow z-50">
      <div className="w-full max-w-[1216px] flex justify-between items-center mx-auto h-full">
        <div className="flex items-center h-full gap-4">
          <Link href="/" className="flex items-center justify-center gap-2.5">
            <p className="text-2xl font-bold text-black">nameful</p>
          </Link>
          <div className="w-1 h-5 grow border-l border-gray-300" />
          <div className="flex items-center h-full">
            <HeaderLink
              label="Register"
              icon={PlusCircleIcon}
              isActive={true}
            />
            <HeaderLink label="Manage" icon={PlusCircleIcon} isActive={true} />
          </div>
        </div>

        <div>
          {isClient && address ? <UserDropdown /> : <ConnectMetamask />}
        </div>
      </div>
    </div>
  );
};

interface HeaderLinkProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

const HeaderLink = ({ icon: Icon, label, isActive }: HeaderLinkProps) => {
  return (
    <Link
      className={cc([
        "flex items-center h-full px-3 gap-2 font-medium hover:bg-gray-50 transition-colors duration-300",
        { "border-blue-500 border-b-2": isActive },
      ])}
      href="/domains"
    >
      <Icon />
      {label}
    </Link>
  );
};
