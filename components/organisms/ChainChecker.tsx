import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAccount } from "wagmi";

const ChainChecker = () => {
  const { address, chain } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (address && !chain?.id) {
      router.push("/not-supported");
    }
  }, [chain, address, router.pathname]);

  return null;
};

export default ChainChecker;
