import { ConnectMetamask } from "@/components/01-atoms";
import { Table } from "@/components/02-molecules";
import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";
import { getNamesForAddress } from "@ensdomains/ensjs/subgraph";
import { Heading, Skeleton } from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PublicClient } from "viem";
import { useAccount, usePublicClient } from "wagmi";

export default function DomainsPage() {
  const [names, setNames] = useState<(string | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { address } = useAccount();

  const publicClient = usePublicClient() as PublicClient & ClientWithEns;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const getNames = async () => {
      setIsLoading(true);

      try {
        if (address) {
          const result = await getNamesForAddress(publicClient, {
            address: address,
          });
          const filteredNames = result.map((object) => object.name);

          setNames([...filteredNames]);
        }
      } catch (error) {
        toast.error("An error occurred");
      }

      setIsLoading(false);
    };

    getNames();
  }, [address]);

  return (
    <div className="w-full text-black px-5 flex h-full flex-col items-center justify-start">
      <div className="w-full flex-col gap-8 py-10 flex justify-start max-w-[1216px]">
        {!address && isClient ? (
          <div className="w-full flex flex-col gap-4 items-center justify-center">
            <Heading level="2" className="text-start text-[26px]">
              You have to connect your wallet to see your domains 😉
            </Heading>
            <div>
              <ConnectMetamask />
            </div>
          </div>
        ) : (
          <Skeleton className="!w-full min-h-[500px]" loading={isLoading}>
            <div className="flex flex-col w-full gap-4">
              <h3 className="text-start text-[26px]"> Manage domains</h3>
              <Table names={names} />
            </div>
          </Skeleton>
        )}
      </div>
    </div>
  );
}
