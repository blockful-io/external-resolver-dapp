import {
  Modal,
  Skeleton,
  RecordItem,
  EthTransparentInvertedSVG,
} from "@ensdomains/thorin";
import { formatDate, formatHexAddress } from "@/lib/utils/formats";
import { CoinInfo, DomainData } from "@/lib/domain-page";
import { useState } from "react";
import { EditResolverModalContent } from "./EditResolverModalContent";
import { useRouter } from "next/router";
import { excludeKeys } from "@/pages/domains/[name]";
import { EmailIcon, GithubIcon, LinkedInIcon, TwitterIcon } from "../01-atoms";
import { TelegramIcon } from "../01-atoms/icons/telegram";
import { isAddress } from "viem";

export interface ProfileTabProps {
  domainData: DomainData | null;
}

export const ProfileTabBody = ({ domainData }: ProfileTabProps) => {
  const [editResolverModalOpen, setEditResolverModalOpen] = useState(false);

  const router = useRouter();
  const { name } = router.query; // Dynamic route parameter

  const millisecondsToSeconds = (millisecodNumber: number): number =>
    millisecodNumber / 1000;

  const resolver = domainData?.resolver;

  const addresses = resolver?.addresses;
  const expiryDate = domainData?.expiryDate;

  let filteredRecords: Record<string, string> = {};

  const textRecords = domainData?.resolver.texts;

  if (domainData && typeof domainData.resolver.texts === "object") {
    filteredRecords = Object.entries(domainData.resolver.texts)
      .filter(([key]) => !excludeKeys.includes(key))
      .reduce((obj: Record<string, string>, [key, value]) => {
        obj[key] = value as string; // Type assertion to string
        return obj;
      }, {});
  }

  const accountKeys = [
    "com.twitter",
    "org.telegram",
    "com.linkedin",
    "com.github",
    "email",
  ];

  const hasAccountKeys = accountKeys.some(
    (key) => textRecords && key in textRecords,
  );

  const linkedIn = textRecords?.["com.linkedin"];
  const twitter = textRecords?.["com.twitter"];
  const github = textRecords?.["com.github"];
  const telegram = textRecords?.["org.telegram"];
  const email = textRecords?.["email"];

  console.log(textRecords);

  return (
    <div className="flex flex-grow flex-col gap-11">
      {!!hasAccountKeys && (
        <div className="flex flex-col gap-4">
          <Skeleton>
            <h3 className="text-base font-semibold">Accounts</h3>
          </Skeleton>
          <div className="flex w-full flex-wrap gap-2 overflow-auto p-1">
            {linkedIn && (
              <Skeleton>
                <RecordItem
                  inline
                  size="large"
                  icon={<LinkedInIcon className="text-blue-500" />}
                  value={linkedIn}
                  link={`https://www.linkedin.com/in/${linkedIn}`}
                  as="a"
                >
                  {linkedIn}
                </RecordItem>
              </Skeleton>
            )}
            {github && (
              <Skeleton>
                <RecordItem
                  inline
                  size="large"
                  icon={<GithubIcon className="text-blue-500" />}
                  value={github}
                  link={`https://github.com/${github}`}
                  as="a"
                >
                  {github}
                </RecordItem>
              </Skeleton>
            )}
            {telegram && (
              <Skeleton>
                <RecordItem
                  inline
                  size="large"
                  icon={<TelegramIcon className="text-blue-500" />}
                  value={telegram}
                  link={`https://t.me/${telegram}`}
                  as="a"
                >
                  {telegram}
                </RecordItem>
              </Skeleton>
            )}
            {twitter && (
              <Skeleton>
                <RecordItem
                  inline
                  size="large"
                  keyLabel="Twitter"
                  icon={<TwitterIcon className="text-blue-500" />}
                  value={twitter}
                  link={`https://twitter.com/${twitter}`}
                  as="a"
                >
                  {twitter}
                </RecordItem>
              </Skeleton>
            )}

            {email && (
              <Skeleton>
                <RecordItem
                  inline
                  size="large"
                  keyLabel="Email"
                  icon={<EmailIcon className="text-blue-500" />}
                  value={email}
                  link={`mailto:${email}`}
                  as="a"
                >
                  {email}
                </RecordItem>
              </Skeleton>
            )}
          </div>
        </div>
      )}

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
            {domainData?.owner && (
              <RecordItem
                inline
                size="large"
                keyLabel="manager"
                value={domainData?.owner ?? ""}
              >
                {isAddress(domainData?.owner)
                  ? formatHexAddress(domainData?.owner)
                  : domainData?.owner}
              </RecordItem>
            )}
          </Skeleton>

          <Skeleton>
            {domainData?.owner && (
              <RecordItem
                inline
                size="large"
                keyLabel="owner"
                value={domainData?.owner}
              >
                {isAddress(domainData?.owner)
                  ? formatHexAddress(domainData?.owner)
                  : domainData?.owner}
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

      {domainData?.contentHash && (
        <div className="flex flex-col gap-4">
          <Skeleton>
            <h3 className="text-base font-semibold">Content Hash</h3>
          </Skeleton>
          <div className="flex flex-col gap-4">
            <Skeleton>
              <RecordItem
                inline
                size="large"
                keyLabel="content hash"
                value={domainData?.contentHash}
              >
                {domainData?.contentHash}
              </RecordItem>
            </Skeleton>
          </div>
        </div>
      )}
      {domainData?.resolver && (
        <div className="flex flex-col gap-4">
          <Skeleton>
            <h3 className="text-base font-semibold">Resolver</h3>
          </Skeleton>
          <div className="flex flex-col gap-4">
            <Skeleton>
              <RecordItem
                inline
                size="large"
                keyLabel="resolver"
                value={domainData.resolver.address}
              >
                {domainData.resolver.address}
              </RecordItem>
            </Skeleton>
          </div>
        </div>
      )}
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
