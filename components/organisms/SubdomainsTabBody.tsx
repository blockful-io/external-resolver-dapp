import { EthTransparentSVG, Skeleton } from "@ensdomains/thorin";
import { ProfileRecordItem } from "../02-molecules";
import { DomainData } from "@/lib/domain-page";

export const SubdomainsTabBody = ({
  domainData,
}: {
  domainData: DomainData | null;
}) => {
  return (
    <div className="flex-grow flex gap-11 flex-col">
      <div className="flex flex-col gap-4">
        <Skeleton>
          <h3 className="font-semibold text-base">Subdomains Tab</h3>
        </Skeleton>
        <ProfileRecordItem
          icon={EthTransparentSVG}
          key={"key"}
          label={"uhuu"}
          text={"subdomain"}
        />
      </div>
    </div>
  );
};
