import Link from "next/link";
import { WalletButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import { Button, WalletSVG } from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import { DEFAULT_CHAIN_ID } from "@/lib/wallet/chains";
import { UserDropdown } from "@/components/02-molecules";
import { ConnectMetamask } from "./ConnectMetamask";

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
    <div className="w-full h-20 py-5 bg-white px-6 flex justify-between items-center shadow z-50">
      <div className="w-full max-w-[1216px] flex justify-between items-center mx-auto">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <p className="text-2xl font-bold text-black">nameful</p>
        </Link>
        <div>
          {isClient && address ? <UserDropdown /> : <ConnectMetamask />}
        </div>
      </div>
    </div>
  );
};
