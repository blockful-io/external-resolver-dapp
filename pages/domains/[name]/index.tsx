import {
  EmailIcon,
  GithubIcon,
  LinkedInIcon,
  PencilIcon,
  TwitterIcon,
} from "@/components/01-atoms";
import {
  FieldsProvider,
  ProfileRecordItem,
  useFields,
} from "@/components/02-molecules";
import CustomImage from "@/components/02-molecules/CustomImage";
import { EditModalContent } from "@/components/organisms/EditModalContent";
import { CoinInfo, getENSDomainData } from "@/lib/utils/ensData";
import { formatDate } from "@/lib/utils/formats";

import {
  Button,
  CalendarSVG,
  CogSVG,
  EthSVG,
  EthTransparentSVG,
  Heading,
  HeartSVG,
  LeftChevronSVG,
  Modal,
  Skeleton,
  SkeletonGroup,
} from "@ensdomains/thorin";
import Avatar from "boring-avatars";
import Link from "next/link";
import { useEffect, useState } from "react";

export function ManageNamePageContent({ name }: { name: string }) {
  const [modalOpen, setModalOpen] = useState(false);

  const [ensData, setEnsData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateFieldsWithEnsData } = useFields();
  const handleFetchENSDomainData = async () => {
    setIsLoading(true);
    try {
      const data = await getENSDomainData(name);
      setEnsData(data);
      updateFieldsWithEnsData(data);
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
    "com.telegram",
    "avatar",
    "com.github",
    "email",
    "description",
    "name",
    "url",
  ];

  interface TextRecord {
    key: string;
    value: string;
  }

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
  if (ensData && Array.isArray(ensData.texts)) {
    filteredRecords = ensData.texts
      .filter((text: TextRecord) => !excludeKeys.includes(text.key))
      .reduce((obj: Record<string, string>, text: TextRecord) => {
        obj[text.key] = text.value;
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
                <div className="w-[376px] flex flex-col rounded-md overflow-hidden border border-gray-200 ">
                  <div className="h-[120px] w-full bg-gradient-ens" />

                  <div className="w-full px-6 pb-6 flex flex-col gap-5">
                    <div className="h-[56px] items-end w-full flex justify-between">
                      {ensData?.texts?.avatar ? (
                        <CustomImage
                          alt="avatar image"
                          width={100}
                          height={100}
                          src={
                            !!ensData?.texts?.avatar
                              ? ensData?.texts?.avatar
                              : "https://source.boringavatars.com/marble/120/Maria%20Mitchell?colors=264653,2a9d8f,e9c46a,f4a261,e76f51"
                          }
                          className="w-[100px] h-[100px] border-4 border-white rounded-[10px]"
                        />
                      ) : (
                        <div className="w-[100px] h-[100px] border-4 bg-gradient-ens border-white rounded-[10px] overflow-hidden">
                          <Avatar
                            size={100}
                            square
                            name="Margaret Bourke"
                            variant="marble"
                            colors={[
                              "#44BCF0",
                              "#7298F8",
                              "#A099FF",
                              "#FFFFFF",
                            ]}
                          />
                        </div>
                      )}

                      <div>
                        <Button
                          onClick={() => {
                            setModalOpen(true);
                          }}
                          size="small"
                          prefix={<PencilIcon />}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <Skeleton>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[26px] truncate">{name}</h3>
                        </div>
                        {ensData?.texts?.url && (
                          <a
                            href={ensData.texts.url}
                            target="_blank"
                            className="text-[16px] text-blue-500"
                          >
                            {ensData.texts.url}
                          </a>
                        )}
                      </Skeleton>
                    </div>
                    <Skeleton>
                      <p className="text-base text-gray-400">
                        {ensData?.texts?.description}
                      </p>
                    </Skeleton>
                    {/* <Skeleton>
                      <div className="flex items-center justify-center gap-2 p-3 rounded-md border border-gray-200">
                        <Toggle />
                        <p>Primary name</p>
                        <InfoCircleSVG className="text-gray-400 h-4 w-4 mr-1" />
                      </div>
                    </Skeleton> */}
                    <div className="flex flex-col items-start justify-center gap-1">
                      {ensData?.texts?.["email"] && (
                        <Link
                          target="_blank"
                          href={`mailto:${ensData?.texts?.["email"]}`}
                          className="p-2 flex gap-2 group"
                        >
                          <EmailIcon className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors duration-200" />
                          <h3 className="text-gray-400 group-hover:text-black transition-colors duration-300">
                            {ensData?.texts?.["email"]}
                          </h3>
                        </Link>
                      )}

                      {!!ensData?.texts?.["com.github"] && (
                        <Link
                          target="_blank"
                          href={`https://github.com/${ensData?.texts["com.github"]}`}
                          className="p-2 flex gap-2 group"
                        >
                          <GithubIcon className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors duration-200" />
                          <h3 className="text-gray-400 group-hover:text-black transition-colors duration-300">
                            {ensData?.texts?.["com.github"]}
                          </h3>
                        </Link>
                      )}

                      {ensData?.texts?.["com.twitter"] && (
                        <Link
                          target="_blank"
                          href={`https://x.com/${ensData?.texts["com.twitter"]}`}
                          className="p-2 flex gap-2 group"
                        >
                          <TwitterIcon className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors duration-200" />
                          <h3 className="text-gray-400 group-hover:text-black transition-colors duration-300">
                            {ensData?.texts?.["com.twitter"]}
                          </h3>
                        </Link>
                      )}

                      {ensData?.texts?.["com.linkedin"] && (
                        <Link
                          target="_blank"
                          href={`https://www.linkedin.com/in/${ensData?.texts["com.linkedin"]}`}
                          className="p-2"
                        >
                          <LinkedInIcon className="w-5 h-5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Skeleton>

              <div className="flex-grow flex gap-11 flex-col">
                {!!ensData?.coins.length &&
                  ensData?.coins.some(
                    (add: CoinInfo | undefined) => typeof add !== "undefined"
                  ) && (
                    <div className="flex flex-col gap-4">
                      <Skeleton>
                        <h3 className="font-semibold text-base">Addresses</h3>
                      </Skeleton>
                      <div className="grid grid-cols-2 gap-4">
                        {ensData?.coins.map((coin: CoinInfo | undefined) => (
                          <>
                            {coin ? (
                              <Skeleton key={coin.name}>
                                <ProfileRecordItem
                                  icon={EthTransparentSVG}
                                  text={coin.value}
                                />
                              </Skeleton>
                            ) : null}
                          </>
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
                        text={ensData?.owner && ensData?.owner}
                      />
                    </Skeleton>

                    <Skeleton>
                      <ProfileRecordItem
                        icon={HeartSVG}
                        label="owner"
                        text={ensData?.owner}
                      />
                    </Skeleton>

                    <Skeleton>
                      <ProfileRecordItem
                        icon={CalendarSVG}
                        label="expiry"
                        text={formatDate({
                          unixTimestamp: ensData?.expiry / 1000,
                        })}
                      />
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
              </div>
            </div>
          </div>
        </div>
      </SkeletonGroup>
      <Modal open={modalOpen} onDismiss={() => {}}>
        <EditModalContent
          onRecordsEdited={handleFetchENSDomainData}
          closeModal={() => {
            setModalOpen(false);
          }}
        />
      </Modal>
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
