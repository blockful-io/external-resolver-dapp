import Link from "next/link";
import { WalletButton } from "@rainbow-me/rainbowkit";
import { UserDropdown } from "@/components/02-molecules/UserDropdown";
import { useAccount, useSwitchChain } from "wagmi";
import { Button, WalletSVG } from "@ensdomains/thorin";
import { useEffect } from "react";
import { DEFAULT_CHAIN_ID } from "@/lib/wallet/chains";

export const DappHeader = () => {
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (chain?.id !== DEFAULT_CHAIN_ID) {
      switchChain({ chainId: DEFAULT_CHAIN_ID });
    }
  }, [chain]);

  return (
    <div className="w-full h-20 py-5 bg-white px-6 flex justify-between items-center shadow z-50">
      <div className="w-full max-w-[1216px] flex justify-between items-center mx-auto">
        <Link
          href="/"
          className="flex items-center justify-center gap-2.5 shadow-2xl"
        >
          <div className="h-6 w-6 bg-gradient-ens rounded-full" />
          <p className="text-xl font-bold text-black">DomainResolver</p>
        </Link>
        <div>
          {address ? (
            <UserDropdown />
          ) : (
            <WalletButton.Custom wallet="metamask">
              {({ ready, connect }) => {
                return (
                  <Button
                    size="medium"
                    disabled={!ready}
                    onClick={connect}
                    colorStyle="blueSecondary"
                    prefix={<WalletSVG />}
                  >
                    Connect Metamask
                  </Button>
                );
              }}
            </WalletButton.Custom>
          )}
        </div>
      </div>
    </div>
  );
};
