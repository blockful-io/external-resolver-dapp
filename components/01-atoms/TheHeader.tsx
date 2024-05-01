import { Button, WalletSVG } from "@ensdomains/thorin";

export const TheHeader = () => {
  return (
    <div className="w-full h-20  absolute top-0 left-0 px-6 flex justify-between items-center shadow-sm">
      <div className="flex items-center justify-center gap-2.5">
        <div className=" h-6 w-6 bg-gradient-ens rounded-full" />
        <p className="text-[16px] font-bold text-black">DomainResolver</p>
      </div>
      <div>
        <Button size="small" colorStyle="blueSecondary" prefix={<WalletSVG />}>
          Connect
        </Button>
      </div>
    </div>
  );
};
