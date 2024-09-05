import { EthSVG } from "@ensdomains/thorin";
import Avatar from "boring-avatars";

interface NewSubdomainInfoProps {
  domain: string;
  website: string;
  description: string;
  EthAddress: string;
}

export const NewSubdomainInfo = ({
  domain = "new domain",
  website,
  description,
  EthAddress,
}: NewSubdomainInfoProps) => {
  return (
    <>
      <p className="text-gray-400">
        Check your information before confirming in your wallet
      </p>
      <div className="rounded-md flex flex-col border border-gray-200 overflow-hidden">
        <div className="flex flex-col p-4 border-b border-gray-200 bg-gray-50  gap-4">
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
              <p className=" text-blue-500 text-sm">{website}</p>
            </div>
          </div>
          <p>{description}</p>
        </div>

        <div className="p-4 flex flex-col">
          <div className="flex w-full justify-between">
            <div className="flex items-center gap-2">
              <EthSVG className="w-4 h-4 text-gray-400" />
              <p className="text-gray-400">ETH Address</p>
            </div>
            <p className="max-w-32 truncate">{EthAddress}</p>
          </div>
        </div>
      </div>
    </>
  );
};
