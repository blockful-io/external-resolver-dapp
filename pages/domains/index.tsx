import { Table } from "@/components/02-molecules";
import {
  client,
  ensPublicClient,
  publicClient,
} from "@/lib/wallet/wallet-config";
import { getNamesForAddress } from "@ensdomains/ensjs/subgraph";
import { Skeleton } from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import { publicActions } from "viem";

export default function RegisterNamePage() {
  const [names, setNames] = useState<(string | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getNames = async () => {
      setIsLoading(true);

      const result = await getNamesForAddress(client, {
        address: "0x89F8e4020c0dd384F13c288bc5743F963F9D8fdF",
      });

      console.log(result);

      const filteredNames = result.map((object) => object.name);

      setNames([...filteredNames]);
      setIsLoading(false);
    };

    getNames();
  }, []);

  return (
    <div className="text-black px-5 flex h-full flex-col items-center justify-start bg-white">
      <div className="w-full flex-col gap-8 py-10 flex justify-start max-w-[1216px]">
        <h3 className="text-start text-[26px]"> Manage domains</h3>
        <Skeleton className="w-full" loading={isLoading}>
          <Table names={names} />
        </Skeleton>
      </div>
    </div>
  );
}
