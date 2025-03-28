import { Skeleton, RecordItem } from "@ensdomains/thorin";
import { formatDate } from "@/lib/utils/formats";
import { CoinInfo, DomainData, getCoinNameByType } from "@/lib/domain-page";

export interface RecordsTabProps {
  domainData: DomainData | null;
}

export const RecordsTabBody = ({ domainData }: RecordsTabProps) => {
  const millisecondsToSeconds = (millisecodNumber: number): number =>
    millisecodNumber / 1000;

  const resolver = domainData?.resolver;

  const addresses = resolver?.addresses;
  const expiryDate = domainData?.expiryDate;
  const textRecords = domainData?.resolver.texts;

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

      {textRecords && Object.entries(textRecords)?.length !== 0 && (
        <div className="flex flex-col gap-4">
          <Skeleton>
            <h3 className="text-base font-semibold">Records</h3>
          </Skeleton>
          <div className="flex flex-col gap-4">
            {Object.entries(textRecords).map(([key, value]) => (
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

      {domainData?.contentHash && (
        <div className="flex flex-col gap-4">
          <Skeleton>
            <h3 className="text-base font-semibold">Content Hash</h3>
          </Skeleton>
          <div className="flex flex-col gap-4">
            <Skeleton>
              <RecordItem
                size="large"
                keyLabel="content hash"
                value={domainData.contentHash}
              >
                {domainData.contentHash}
              </RecordItem>
            </Skeleton>
          </div>
        </div>
      )}
    </div>
  );
};
