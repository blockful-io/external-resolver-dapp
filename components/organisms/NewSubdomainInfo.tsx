import { EthSVG } from "@ensdomains/thorin";
import Avatar from "boring-avatars";

interface NewSubdomainInfoProps {
  domain: string;
  website: string;
  description: string;
  ethAddress: string;
}

export const NewSubdomainInfo = ({
  domain = "new domain",
  website,
  description,
  ethAddress,
}: NewSubdomainInfoProps) => {
  return (
    <>
      <p className="text-gray-400">
        Check your information before confirming in your wallet
      </p>
      <div className="flex flex-col overflow-hidden rounded-md border border-gray-200">
        <div className="flex flex-col gap-4 border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex gap-4">
            <Avatar
              size={40}
              square
              name="Margaret Bourke"
              variant="marble"
              colors={["#44BCF0", "#7298F8", "#A099FF", "#FFFFFF"]}
            />
            <div className="flex flex-col">
              <p className="font-bold">{domain}</p>
              <p className="text-sm text-blue-500">{website}</p>
            </div>
          </div>
          <p>{description}</p>
        </div>

        <div className="flex flex-col p-4">
          <div className="flex w-full justify-between">
            <div className="flex items-center gap-2">
              <EthSVG className="h-4 w-4 text-gray-400" />
              <p className="text-gray-400">ETH Address</p>
            </div>
            <p className="max-w-32 truncate">{ethAddress}</p>
          </div>
        </div>
      </div>
    </>
  );
};
