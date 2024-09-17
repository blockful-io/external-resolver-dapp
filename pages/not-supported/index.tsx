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
    return null; // or a loading spinner
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-gradient-ens">
          Chain Not Supported
        </h1>
        <p className="text-gray-700 mb-6">
          {chain?.name &&
            `You are currently connected to ${chain.name}, which is not supported.`}
        </p>
        <p className="text-gray-700 mb-6">
          Please switch to one of the supported networks
        </p>
      </div>
    </div>
  );
};

export default NotSupportedPage;
