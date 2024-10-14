import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";

const NotSupportedPage = () => {
  const { chain, address } = useAccount();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log("Hello from ChainChecker", !address || chain?.id);

    if (!address || chain?.id) {
      router.push("/");
    }
  }, [chain, address]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="text-gradient-ens mb-4 text-3xl font-bold">
          Chain Not Supported
        </h1>
        <p className="mb-6 text-gray-700">
          {chain?.name &&
            `You are currently connected to ${chain.name}, which is not supported.`}
        </p>
        <p className="mb-6 text-gray-700">
          Please switch to one of the supported networks
        </p>
      </div>
    </div>
  );
};

export default NotSupportedPage;
