import { Table } from "@/components/02-molecules";
import { useUser } from "@/lib/wallet/useUser";
import { client } from "@/lib/wallet/wallet-config";
import { getNamesForAddress } from "@ensdomains/ensjs/subgraph";
import { Button, Heading, Skeleton, WalletSVG } from "@ensdomains/thorin";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";

export default function RegisterNamePage() {
  const [names, setNames] = useState<(string | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authedUser } = useUser();

  useEffect(() => {
    const getNames = async () => {
      setIsLoading(true);

      if (authedUser) {
        const result = await getNamesForAddress(client, {
          address: authedUser,
        });

        const filteredNames = result.map((object) => object.name);

        setNames([...filteredNames]);
      }

      setIsLoading(false);
    };

    getNames();
  }, [authedUser]);

  return (
    <div className="w-full text-black px-5 flex h-full flex-col items-center justify-start bg-white">
      <div className="w-full flex-col gap-8 py-10 flex justify-start max-w-[1216px]">
        <Skeleton className="!w-full h-[500px]" loading={isLoading}>
          {!authedUser ? (
            <div className="w-full flex flex-col gap-4 items-center justify-center">
              <Heading level="2" className="text-start text-[26px]">
                You have to connect your wallet to see your domains 😉
              </Heading>
              <div>
                <ConnectButton.Custom>
                  {({ openConnectModal }) => {
                    return (
                      <Button
                        onClick={(e: any) => {
                          openConnectModal();
                          e.preventDefault();
                        }}
                        size="small"
                        colorStyle="blueSecondary"
                        prefix={<WalletSVG />}
                      >
                        Connect
                      </Button>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </div>
          ) : (
            <div className="flex flex-col w-full gap-4">
              <h3 className="text-start text-[26px]"> Manage domains</h3>
              <Table names={names} />
            </div>
          )}
        </Skeleton>
      </div>
    </div>
  );
}
