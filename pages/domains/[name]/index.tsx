import { DatabaseIcon } from "@/components/01-atoms";
import {
  FieldsProvider,
  ProfileRecordItem,
  useFields,
} from "@/components/02-molecules";

import { EditResolverModalContent } from "@/components/organisms/EditResolverModalContent";
import { UserDomainCard } from "@/components/organisms/UserDomainCard";
import { CoinInfo, DomainData, getENSDomainData } from "@/lib/domain-page";
import { formatDate, formatHexAddress } from "@/lib/utils/formats";

import {
  Button,
  CalendarSVG,
  CogSVG,
  EthTransparentSVG,
  Heading,
  HeartSVG,
  LeftChevronSVG,
  Modal,
  Skeleton,
  SkeletonGroup,
} from "@ensdomains/thorin";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useEnsName } from "wagmi";

export function ManageNamePageContent({ name }: { name: string }) {
  const [editResolverModalOpen, setEditResolverModalOpen] = useState(false);

  const [ensData, setEnsData] = useState<DomainData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateEditModalFieldsWithEnsData } = useFields();

  const { address } = useAccount();

  const { data: authedUserName } = useEnsName({
    address: address,
  });

  const handleFetchENSDomainData = async () => {
    setIsLoading(true);
    try {
      const data = await getENSDomainData(name);
      setEnsData(data);
      updateEditModalFieldsWithEnsData(data);
      setError(null);
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setEnsData(null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    handleFetchENSDomainData();
  }, []);

  const excludeKeys = [
    "com.twitter",
    // "org.telegram", telegram is not yet shown in UserDomainCard
    "com.linkedin",
    "avatar",
    "com.github",
    "email",
    "description",
    "name",
    "url",
  ];

  if (!ensData && error) {
    return (
      <div className="w-full max-w-[1216px] m-auto flex flex-col items-center justify-center mt-[200px]">
        <Heading level="2" as="h3" className="p-4 text-black text-center">
          😵
          <br /> We had an error when loading this domain data
        </Heading>
        <Button
          onClick={() => window.location.reload()}
          colorStyle="blueSecondary"
          className="mt-5"
        >
          Try again?
        </Button>
      </div>
    );
  }

  let filteredRecords: Record<string, string> = {};

  if (ensData && typeof ensData.resolver.texts === "object") {
    filteredRecords = Object.entries(ensData.resolver.texts)
      .filter(([key]) => !excludeKeys.includes(key))
      .reduce((obj: Record<string, string>, [key, value]) => {
        obj[key] = value as string; // Type assertion to string
        return obj;
      }, {});
  }

  if (!ensData && !isLoading) {
    return (
      <div className="w-full max-w-[1216px] m-auto flex flex-col items-center justify-center mt-[200px]">
        <Heading level="2" as="h3" className="p-4 text-black text-center">
          👀
          <br /> This domain is not yet registered
        </Heading>
        <Link href={`/register/${name}`} className="mt-5">
          <Button colorStyle="blueSecondary">Want to register it?</Button>
        </Link>
      </div>
    );
  }

  const millisencondsToSeconds = (millisecodNumber: number): number =>
    millisecodNumber / 1000;

  const resolver = ensData?.resolver;
  const textRecords = resolver?.texts;
  const addresses = resolver?.addresses;
  const expiryDate = ensData?.expiryDate;

  return (
    <div className="text-black flex flex-col items-center justify-start bg-white">
      <div className="w-full border-b border-gray-200 py-4 px-[60px] flex items-start">
        <div className="w-full max-w-[1216px] flex mx-auto">
          <Link
            href="/domains"
            className="flex items-center justify-center flex-shrink text-gray-400 hover:text-black duration-300 transition-colors gap-2"
          >
            <LeftChevronSVG /> <p className="text-black">Back</p>
          </Link>
        </div>
      </div>
      <SkeletonGroup loading={isLoading}>
        <div className="w-full p-[60px]">
          <div className="w-full max-w-[1216px] mx-auto flex flex-col gap-7">
            <div className="w-full flex gap-[60px]">
              <Skeleton>
                <UserDomainCard
                  name={name}
                  avatar={textRecords?.avatar}
                  url={textRecords?.url}
                  description={textRecords?.description}
                  email={textRecords?.["email"]}
                  github={textRecords?.["com.github"]}
                  twitter={textRecords?.["com.twitter"]}
                  linkedIn={textRecords?.["com.linkedin"]}
                  onRecordsEdited={handleFetchENSDomainData}
                />
              </Skeleton>

              <div className="flex-grow flex gap-11 flex-col">
                {!!addresses?.length && (
                  <div className="flex flex-col gap-4">
                    <Skeleton>
                      <h3 className="font-semibold text-base">Addresses</h3>
                    </Skeleton>
                    <div className="grid grid-cols-2 gap-4">
                      {addresses.map(
                        (coin: CoinInfo | undefined, index: number) => (
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
                        )
                      )}
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
                        text={ensData?.owner ?? ""}
                      />
                    </Skeleton>

                    <Skeleton>
                      {ensData?.owner && (
                        <ProfileRecordItem
                          icon={HeartSVG}
                          label="owner"
                          text={ensData?.owner}
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

                        {authedUserName === ensData?.owner && (
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
              </div>
            </div>
          </div>
        </div>
      </SkeletonGroup>

      {resolver?.address && (
        <Modal open={editResolverModalOpen} onDismiss={() => {}}>
          <EditResolverModalContent
            currentResolverAddress={resolver?.address}
            name={name}
            onCloseModal={() => {
              setEditResolverModalOpen(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

export async function getServerSideProps({
  params,
}: {
  params: { name: string };
}) {
  return {
    props: {
      name: params.name,
    },
  };
}

export default function ManageNamePage({ name }: { name: string }) {
  return (
    <FieldsProvider>
      <ManageNamePageContent name={name} />
    </FieldsProvider>
  );
}
