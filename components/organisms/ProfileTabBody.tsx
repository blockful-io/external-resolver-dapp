import {
  Modal,
  Skeleton,
  RecordItem,
  EthTransparentInvertedSVG,
} from "@ensdomains/thorin";
import { formatDate, formatHexAddress } from "@/lib/utils/formats";
import { CoinInfo, DomainData } from "@/lib/domain-page";
import { useAccount, useEnsName } from "wagmi";
import { useState } from "react";
import { EditResolverModalContent } from "./EditResolverModalContent";
import { useRouter } from "next/router";
import { excludeKeys } from "@/pages/domains/[name]";

export interface ProfileTabProps {
  domainData: DomainData | null;
}

export const ProfileTabBody = ({ domainData }: ProfileTabProps) => {
  const [editResolverModalOpen, setEditResolverModalOpen] = useState(false);
  const { address } = useAccount();

  const router = useRouter();
  const { name } = router.query; // Dynamic route parameter

  const { data: authedUserName } = useEnsName({
    address: address,
  });

  const showEditButton: boolean =
    authedUserName === domainData?.owner || address === domainData?.owner;

  const millisecondsToSeconds = (millisecodNumber: number): number =>
    millisecodNumber / 1000;

  const resolver = domainData?.resolver;

  const addresses = resolver?.addresses;
  const expiryDate = domainData?.expiryDate;

  let filteredRecords: Record<string, string> = {};

  if (domainData && typeof domainData.resolver.texts === "object") {
    filteredRecords = Object.entries(domainData.resolver.texts)
      .filter(([key]) => !excludeKeys.includes(key))
      .reduce((obj: Record<string, string>, [key, value]) => {
        obj[key] = value as string; // Type assertion to string
        return obj;
      }, {});
  }

  return (
    <div className="flex flex-grow flex-col gap-11">
      {/* ADDRESSES */}
      {!!addresses?.length && (
        <div className="flex flex-col gap-4">
          <Skeleton>
            <h3 className="text-base font-semibold">Addresses</h3>
          </Skeleton>
          <div className="flex w-full flex-wrap gap-2 overflow-auto">
            {addresses.map((coin: CoinInfo | undefined, index: number) =>
              coin ? (
                <Skeleton key={coin.coin}>
                  <RecordItem
                    size="large"
                    inline
                    className="flex items-center justify-center"
                    // keyLabel={getCoinNameByType(coin.coin)}
                    icon={
                      <EthTransparentInvertedSVG
                        className="text-blue-500"
                        coin={coin.coin}
                      />
                    }
                    value={coin.address}
                  >
                    {formatHexAddress(coin.address)}
                  </RecordItem>
                </Skeleton>
              ) : null,
            )}
          </div>
        </div>
      )}

      {Object.keys(filteredRecords).length !== 0 && (
        <div className="flex flex-col gap-4">
          <Skeleton>
            <h3 className="text-base font-semibold">Other Records</h3>
          </Skeleton>
          <div className="flex w-full flex-wrap gap-4 overflow-auto">
            {Object.entries(filteredRecords).map(([key, value]) => (
              <Skeleton key={key}>
                <RecordItem inline size="large" keyLabel={key} value={value}>
                  {value}
                </RecordItem>
              </Skeleton>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <Skeleton>
          <h3 className="text-base font-semibold">Ownership</h3>
        </Skeleton>

        <div className="flex w-full flex-wrap gap-2 overflow-auto">
          <Skeleton>
            <RecordItem
              inline
              size="large"
              keyLabel="manager"
              value={domainData?.owner ?? ""}
            >
              {domainData?.owner ?? ""}
            </RecordItem>
          </Skeleton>

          <Skeleton>
            {domainData?.owner && (
              <RecordItem
                inline
                size="large"
                keyLabel="owner"
                value={domainData?.owner}
              >
                {domainData?.owner}
              </RecordItem>
            )}
          </Skeleton>

          <Skeleton>
            {expiryDate !== undefined && (
              <RecordItem
                inline
                size="large"
                keyLabel="expiry"
                className="whitespace-nowrap"
                value={formatDate({
                  unixTimestamp: millisecondsToSeconds(expiryDate),
                })}
              >
                {formatDate({
                  unixTimestamp: millisecondsToSeconds(expiryDate),
                })}
              </RecordItem>
            )}
          </Skeleton>
          <Skeleton>
            {domainData?.parent && (
              <RecordItem
                inline
                size="large"
                keyLabel="parent"
                value={domainData.parent}
              >
                {domainData.parent}
              </RecordItem>
            )}
          </Skeleton>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton>
          <h3 className="text-base font-semibold">Content Hash</h3>
        </Skeleton>
        <div className="flex flex-col gap-4">
          <Skeleton>
            <RecordItem
              size="large"
              keyLabel="content hash"
              value={domainData?.contentHash || "No Content Hash"}
            >
              {domainData?.contentHash || "No Content Hash"}
            </RecordItem>
          </Skeleton>
        </div>
      </div>
      {resolver?.address && (
        <Modal open={editResolverModalOpen} onDismiss={() => {}}>
          <EditResolverModalContent
            currentResolverAddress={resolver?.address}
            name={name as string}
            onCloseModal={() => {
              setEditResolverModalOpen(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
};
