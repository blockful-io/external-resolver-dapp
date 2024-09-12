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
    <div className="bg-yellow-100 w-full p-2 flex items-center justify-center text-black">
      You are viewing the Nameful app on {chain?.name} testnet.
    </div>
  );
};
