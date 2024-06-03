import { Button, WalletSVG } from "@ensdomains/thorin";
import Link from "next/link";

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
        <Button size="small" colorStyle="blueSecondary" prefix={<WalletSVG />}>
          Connect
        </Button>
      </div>
    </div>
  );
};
