import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const TestnetBanner = () => {
  const [isClient, setIsClient] = useState(false);
  const { chain } = useAccount();

  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) return null;

  return (
    <div className="flex w-full items-center justify-center bg-yellow-100 p-2 text-black">
      You are viewing the Nameful app on {chain?.name} testnet.
    </div>
  );
};
