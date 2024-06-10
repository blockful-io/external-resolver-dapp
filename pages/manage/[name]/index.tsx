import {
  EmailIcon,
  GithubIcon,
  LinkedInIcon,
  PencilIcon,
  TwitterIcon,
} from "@/components/01-atoms";
import {
  AccountsTab,
  AddressesTab,
  OthersTab,
  ProfileTab,
  FieldsProvider,
  Tab,
  ProfileRecordItem,
} from "@/components/02-molecules";
import { EditModalContent } from "@/components/organisms/EditModalContent";
import { formatDate, formatHexAddress, getENSData } from "@/lib/utils/ens";

import {
  Button,
  CalendarSVG,
  CogSVG,
  EthTransparentSVG,
  HeartSVG,
  InfoCircleSVG,
  LeftChevronSVG,
  Modal,
  Toggle,
} from "@ensdomains/thorin";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const tabComponents: Record<Tab, React.FC> = {
  [Tab.Profile]: ProfileTab,
  [Tab.Accounts]: AccountsTab,
  [Tab.Addresses]: AddressesTab,
  [Tab.Others]: OthersTab,
};

export function ManageNamePageContent({ name }: { name: string }) {
  const [modalOpen, setModalOpen] = useState(false);

  const [ensData, setEnsData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchENS = async () => {
    try {
      const resolveENS = getENSData();
      const data = await resolveENS(name);
      setEnsData(data);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setEnsData(null);
    }
  };

  useEffect(() => {
    handleFetchENS();
  }, []);

  return (
    <div className="text-black flex flex-col items-center justify-start bg-white">
      <div className="w-full h-[200px] bg-gradient-ens py-10 px-[60px] flex items-start">
        <div className="w-full max-w-[1216px] flex mx-auto">
          <Link
            href="/manage"
            className="flex items-center justify-center flex-shrink text-white gap-2"
          >
            <LeftChevronSVG /> <p>Back</p>
          </Link>
        </div>
      </div>
      <div className="w-full relative max-w-[1216px] m-auo">
        <Image
          alt="avatar image"
          width={100}
          height={100}
          src={ensData?.textRecords?.avatar}
          className="w-[100px] h-[100px] bg-purple-500 absolute left-0 -translate-y-1/2 border-4 border-white rounded-[10px]"
        />
      </div>
      <div className="w-full px-[60px]">
        <div className="w-full max-w-[1216px] mx-auto flex flex-col gap-7">
          <div className="h-[50px] w-full flex justify-end items-end">
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
          <div className="flex flex-col gap-1">
            <div className="text-[26px]">{name}</div>
            <p className="text-base text-gray-400">
              {ensData?.textRecords?.description}
            </p>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center justify-center gap-1">
              {ensData?.textRecords?.["email"] && (
                <Link
                  target="_blank"
                  href={`mailto:${ensData?.textRecords?.["email"]}`}
                  className="p-2"
                >
                  <EmailIcon className="w-5 h-5" />
                </Link>
              )}

              {!!ensData?.textRecords?.["com.github"] && (
                <Link
                  target="_blank"
                  href={`https://github.com/${ensData?.textRecords["com.github"]}`}
                  className="p-2"
                >
                  <GithubIcon className="w-5 h-5" />
                </Link>
              )}

              {ensData?.textRecords?.["com.twitter"] && (
                <Link
                  target="_blank"
                  href={`https://x.com/${ensData?.textRecords["com.twitter"]}`}
                  className="p-2"
                >
                  <TwitterIcon className="w-5 h-5" />
                </Link>
              )}

              {ensData?.textRecords?.["com.linkedin"] && (
                <Link
                  target="_blank"
                  href={`https://www.linkedin.com/in/${ensData?.textRecords["com.linkedin"]}`}
                  className="p-2"
                >
                  <LinkedInIcon className="w-5 h-5" />
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2 p-3 rounded-full border border-gray-200">
              <Toggle />
              <p>Primary name</p>
              <InfoCircleSVG className="text-gray-400 h-4 w-4 mr-1" />
            </div>
          </div>

          <div className="py-4 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-base">Addresses</h3>

              <ProfileRecordItem
                icon={EthTransparentSVG}
                text={formatHexAddress(ensData?.address)}
              />
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-base">Ownership</h3>

              <ProfileRecordItem
                icon={CogSVG}
                label="manager"
                text={formatHexAddress(ensData?.ownerId)}
              />

              <ProfileRecordItem
                icon={HeartSVG}
                label="owner"
                text={formatHexAddress(ensData?.ownerId)}
              />

              <ProfileRecordItem
                icon={CalendarSVG}
                label="expiry"
                text={formatDate({
                  unixTimestamp: parseInt(ensData?.expiryDate),
                })}
              />

              <ProfileRecordItem
                icon={EthTransparentSVG}
                label="parent"
                text={ensData?.parentName}
              />
            </div>
          </div>
        </div>
      </div>
      <Modal open={modalOpen} onDismiss={() => {}}>
        <EditModalContent
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
