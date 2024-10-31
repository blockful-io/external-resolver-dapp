import { ConnectMetamask } from "@/components/atoms";
import { Table } from "@/components/molecules";
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
    <div className="flex h-full w-full flex-col items-center justify-start px-5 text-black">
      <div className="flex w-full max-w-[1216px] flex-col justify-start gap-8 py-10">
        {!address && isClient ? (
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <Heading level="2" className="text-start text-[26px]">
              You have to connect your wallet to see your domains 😉
            </Heading>
            <div>
              <ConnectMetamask />
            </div>
          </div>
        ) : (
          <Skeleton className="min-h-[500px] !w-full" loading={isLoading}>
            <div className="flex w-full flex-col gap-4">
              <h3 className="text-start text-[26px]"> Manage domains</h3>
              <Table names={names} />
            </div>
          </Skeleton>
        )}
      </div>
    </div>
  );
}
