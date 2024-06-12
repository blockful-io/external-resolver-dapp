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
  useFields,
  Tab,
  ProfileRecordItem,
  Table,
} from "@/components/02-molecules";
import { EditModalContent } from "@/components/organisms/EditModalContent";

import {
  Button,
  CalendarSVG,
  CogSVG,
  EthTransparentSVG,
  HeartSVG,
  InfoCircleSVG,
  KeySVG,
  LeftChevronSVG,
  Modal,
  Toggle,
} from "@ensdomains/thorin";
import Link from "next/link";
import { useState } from "react";

const tabComponents: Record<Tab, React.FC> = {
  [Tab.Profile]: ProfileTab,
  [Tab.Accounts]: AccountsTab,
  [Tab.Addresses]: AddressesTab,
  [Tab.Others]: OthersTab,
};

export function ManageNamePageContent({ name }: { name: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(Tab.Profile);
  const CurrentComponent = tabComponents[selectedTab];

  const { fields, initialFields, setInitialFields, setFields } = useFields();

  return (
    <div className="text-black flex flex-col items-center justify-start bg-white">
      <div className="w-full h-[200px] bg-gradient-ens py-10 px-[60px] flex items-start">
        <div className="w-full max-w-[1216px] flex mx-auto">
          <Link
            href="/domains"
            className="flex items-center justify-center flex-shrink text-white gap-2"
          >
            <LeftChevronSVG /> <p>Back</p>
          </Link>
        </div>
      </div>
      <div className="w-full relative max-w-[1216px] m-auo">
        <div className="w-[100px] h-[100px] bg-purple-500 absolute left-0 -translate-y-1/2 border-4 border-white rounded-[10px]"></div>
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
              Cool Cats is a collection of 9,999 randomly generated and
              stylistically curated NFTs.
            </p>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center justify-center gap-1">
              <div className="p-2">
                <EmailIcon className="w-5 h-5" />
              </div>
              <div className="p-2">
                <GithubIcon className="w-5 h-5" />
              </div>
              <div className="p-2">
                <TwitterIcon className="w-5 h-5" />
              </div>
              <div className="p-2">
                <LinkedInIcon className="w-5 h-5" />
              </div>
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
                text="0x000ee...575FB098991"
              />
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-base">Other records</h3>

              <ProfileRecordItem
                icon={KeySVG}
                label="keywords"
                text="0x000ee...575FB098991"
              />
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-base">Ownership</h3>

              <ProfileRecordItem
                icon={CogSVG}
                label="manager"
                text="0x000ee...575FB098991"
              />

              <ProfileRecordItem
                icon={HeartSVG}
                label="manager"
                text="0x000ee...575FB098991"
              />

              <ProfileRecordItem
                icon={CalendarSVG}
                label="manager"
                text="0x000ee...575FB098991"
              />

              <ProfileRecordItem
                icon={EthTransparentSVG}
                label="manager"
                text="0x000ee...575FB098991"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-[1216px] py-10 flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <h3 className="text-[22px]">Profile records</h3>
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
        <div></div>
        <Table />
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
