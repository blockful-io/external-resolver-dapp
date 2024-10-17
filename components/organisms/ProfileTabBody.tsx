import { Button, Modal, Skeleton, RecordItem } from "@ensdomains/thorin";
import { DatabaseIcon } from "../01-atoms";
import { formatDate } from "@/lib/utils/formats";
import { CoinInfo, DomainData, getCoinNameByType } from "@/lib/domain-page";
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
          <div className="flex flex-col gap-4">
            {addresses.map((coin: CoinInfo | undefined, index: number) =>
              coin ? (
                <Skeleton key={coin.coin}>
                  <RecordItem
                    size="large"
                    className="flex items-center justify-center"
                    keyLabel={getCoinNameByType(coin.coin)}
                    value={coin.address}
                  >
                    {coin.address}
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
          <div className="flex flex-col gap-4">
            {Object.entries(filteredRecords).map(([key, value]) => (
              <Skeleton key={key}>
                <RecordItem size="large" keyLabel={key} value={value}>
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

        <div className="flex flex-col gap-4">
          <Skeleton>
            <RecordItem
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
                size="large"
                keyLabel="expiry"
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
          <h3 className="text-base font-semibold">Resolver</h3>
        </Skeleton>
        <div className="flex flex-col gap-4">
          <Skeleton>
            <div className="flex items-center justify-between gap-4 overflow-hidden rounded-md bg-gray-50 px-2 py-2">
              <div className="flex items-center gap-4">
                <div className="flex gap-4 rounded-md bg-blue-100 p-2">
                  <DatabaseIcon className="h-5 w-5 text-blue-500" />
                </div>

                {resolver?.address && (
                  <p className="truncate whitespace-nowrap">
                    {resolver?.address}
                  </p>
                )}
              </div>

              {showEditButton && (
                <div>
                  <Button
                    onClick={() => {
                      setEditResolverModalOpen(true);
                    }}
                    size="small"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
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
