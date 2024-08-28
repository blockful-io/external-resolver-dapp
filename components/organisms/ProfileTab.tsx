import {
  Button,
  CalendarSVG,
  CogSVG,
  EthTransparentSVG,
  HeartSVG,
  Modal,
  Skeleton,
} from "@ensdomains/thorin";
import { ProfileRecordItem } from "../02-molecules";
import { DatabaseIcon } from "../01-atoms";
import { formatDate, formatHexAddress } from "@/lib/utils/formats";
import { CoinInfo, DomainData } from "@/lib/domain-page";
import { useAccount, useEnsName } from "wagmi";
import { useState } from "react";
import { EditResolverModalContent } from "./EditResolverModalContent";
import { useRouter } from "next/router";
import { excludeKeys } from "@/pages/domains/[name]";

export const ProfileTab = ({
  domainData,
}: {
  domainData: DomainData | null;
}) => {
  const [editResolverModalOpen, setEditResolverModalOpen] = useState(false);
  const { address } = useAccount();

  const router = useRouter();
  const { name } = router.query; // Dynamic route parameter

  const { data: authedUserName } = useEnsName({
    address: address,
  });

  const showEditButton: boolean =
    authedUserName === domainData?.owner || address === domainData?.owner;

  console.log("authedUserName ", address, domainData?.owner);

  const millisencondsToSeconds = (millisecodNumber: number): number =>
    millisecodNumber / 1000;

  const resolver = domainData?.resolver;

  const textRecords = resolver?.texts;
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
    <div className="flex-grow flex gap-11 flex-col">
      {!!addresses?.length && (
        <div className="flex flex-col gap-4">
          <Skeleton>
            <h3 className="font-semibold text-base">Addresses</h3>
          </Skeleton>
          <div className="grid grid-cols-2 gap-4">
            {addresses.map((coin: CoinInfo | undefined, index: number) => (
              <div key={index}>
                {coin ? (
                  <Skeleton key={coin.coin}>
                    <ProfileRecordItem
                      icon={EthTransparentSVG}
                      text={coin.address}
                    />
                  </Skeleton>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(filteredRecords).length !== 0 && (
        <div className="flex flex-col gap-4">
          <Skeleton>
            <h3 className="font-semibold text-base">Other Records</h3>
          </Skeleton>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(filteredRecords).map(([key, value]) => (
              <Skeleton key={key}>
                <ProfileRecordItem
                  icon={EthTransparentSVG}
                  key={key}
                  label={key}
                  text={value}
                />
              </Skeleton>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        <Skeleton>
          <h3 className="font-semibold text-base">Ownership</h3>
        </Skeleton>

        <div className="grid grid-cols-2 gap-4">
          <Skeleton>
            <ProfileRecordItem
              icon={CogSVG}
              label="manager"
              text={domainData?.owner ?? ""}
            />
          </Skeleton>

          <Skeleton>
            {domainData?.owner && (
              <ProfileRecordItem
                icon={HeartSVG}
                label="owner"
                text={domainData?.owner}
              />
            )}
          </Skeleton>

          <Skeleton>
            {expiryDate !== undefined && (
              <ProfileRecordItem
                icon={CalendarSVG}
                label="expiry"
                text={formatDate({
                  unixTimestamp: millisencondsToSeconds(expiryDate),
                })}
              />
            )}
          </Skeleton>
          <Skeleton>
            <ProfileRecordItem
              icon={EthTransparentSVG}
              label="parent"
              text="ETH"
            />
          </Skeleton>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton>
          <h3 className="font-semibold text-base">Resolver</h3>
        </Skeleton>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton>
            <div className="flex justify-between items-center gap-4 px-2 py-2 rounded-md bg-gray-50 overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="flex gap-4 p-2 rounded-md bg-blue-100">
                  <DatabaseIcon className="h-5 w-5 text-blue-500" />
                </div>

                {resolver?.address && (
                  <p className="whitespace-nowrap truncate">
                    {formatHexAddress(resolver?.address)}
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
