import { Button, WalletSVG } from "@ensdomains/thorin";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { UserDropdown } from "@/components/02-molecules/UserDropdown";

export const DappHeader = () => {
  return (
    <div className="w-full h-20 py-5 bg-white px-6 flex justify-between items-center shadow z-50">
      <Link
        href="/"
        className="flex items-center justify-center gap-2.5 shadow-2xl"
      >
        <div className="h-6 w-6 bg-gradient-ens rounded-full" />
        <p className="text-base font-bold text-black">DomainResolver</p>
      </Link>
      <div>
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== "loading";
            const connected =
              ready &&
              account &&
              chain &&
              authenticationStatus === "authenticated";

            if (!connected) {
              return (
                <Button
                  onClick={(e: any) => {
                    openConnectModal();
                    e.preventDefault();
                  }}
                  size="small"
                  colorStyle="blueSecondary"
                  prefix={<WalletSVG />}
                >
                  Connect
                </Button>
              );
            }

            const unsupportedChainClassName = `inline-flex w-auto flex-shrink-0 appearance-none items-center justify-center space-x-2 rounded-md px-5 py-2.5`;

            if (chain.unsupported) {
              return (
                <button
                  onClick={(e: any) => {
                    openChainModal();
                    e.preventDefault();
                  }}
                  type="button"
                  className={unsupportedChainClassName}
                >
                  <span className="flex-shrink-0 text-sm font-medium">
                    Unsupported network
                  </span>
                </button>
              );
            }

            return <UserDropdown />;
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  );
};
