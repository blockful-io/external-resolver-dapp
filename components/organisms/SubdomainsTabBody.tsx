import { Skeleton } from "@ensdomains/thorin";
import { Table } from "../02-molecules";
import { DomainData } from "@/lib/domain-page";

export interface SubdomainsTabProps {
  domainData: DomainData | null;
}

export const SubdomainsTabBody = ({ domainData }: SubdomainsTabProps) => {
  const subdomainsArray: string[] | undefined = domainData?.subdomains.map(
    (domain) => domain?.name as string
  );

  return (
    <div className="flex-grow flex gap-8 flex-col">
      <div className="flex flex-col gap-1">
        <Skeleton>
          <h3 className=" text-2xl font-bold">Subdomains</h3>
        </Skeleton>
        <Skeleton>
          <p className="text-base text-gray-400">
            Generate more domain names from your existing one.
          </p>
        </Skeleton>
      </div>
      <Skeleton>
        {subdomainsArray?.length ? (
          <Table names={subdomainsArray} />
        ) : (
          <p>No subnames have been added.</p>
        )}
      </Skeleton>
    </div>
  );
};
