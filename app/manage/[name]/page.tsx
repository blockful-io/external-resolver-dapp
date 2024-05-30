"use client";

import { PencilIcon } from "@/components/01-atoms";
import {
  AccountsTab,
  AddressesTab,
  OthersTab,
  ProfileTab,
  Table,
} from "@/components/02-molecules";
import {
  FieldsProvider,
  useFields,
  Tab,
} from "@/components/02-molecules/edit/FieldsContext";
import { Button, LeftChevronSVG, Modal } from "@ensdomains/thorin";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const tabComponents: Record<Tab, React.FC> = {
  [Tab.Profile]: ProfileTab,
  [Tab.Accounts]: AccountsTab,
  [Tab.Addresses]: AddressesTab,
  [Tab.Others]: OthersTab,
};

const ManageNamePageContent: React.FC = () => {
  const params = useParams();
  const name = params.name;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(Tab.Profile);
  const CurrentComponent = tabComponents[selectedTab];

  const { fields, initialFields, setInitialFields, setFields } = useFields();

  return (
    <div className="text-black flex h-full flex-col items-center justify-start bg-white">
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
        <div className="w-[100px] h-[100px] bg-purple-500 absolute left-0 -translate-y-1/2 border-4 border-white rounded-[10px]"></div>
      </div>
      <div className="w-full px-[60px] border-b border-gray-200">
        <div className="w-full max-w-[1216px] mx-auto flex flex-col gap-7">
          <div className="h-[50px] w-full" />
          <div className="flex flex-col gap-1">
            <div className="text-[26px]">{name}</div>
            <p className="text-base text-gray-400">
              Cool Cats is a collection of 9,999 randomly generated and
              stylistically curated NFTs.
            </p>
          </div>
          <div className="w-full flex translate-y-[1px]">
            <button className="flex p-4 border-b border-blue-500 text-blue-500 font-semibold hover:bg-gray-50 transition-colors duration-200">
              Profile
            </button>
            <button className="flex p-4 border-b text-gray-400 hover:bg-gray-50 transition-colors duration-200">
              Subdomains
            </button>
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
      <Modal
        open={modalOpen}
        onDismiss={() => {
          setFields(initialFields);
        }}
      >
        <div className="w-[480px] border rounded-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="py-5 px-6 flex justify-between w-full bg-gray-50 border-b">
              Edit Records
            </div>
            <div className="flex justify-around w-full bg-white">
              <button
                onClick={() => {
                  setSelectedTab(Tab.Profile);
                }}
                className={`py-3 w-full flex items-center border-b justify-center hover:bg-gray-50 transition-all duration-300 ${
                  selectedTab === Tab.Profile
                    ? "text-blue-500 border-blue-500"
                    : "text-gray-500 border-gray-200"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setSelectedTab(Tab.Accounts);
                }}
                className={`py-3 w-full flex items-center border-b justify-center hover:bg-gray-50 transition-all duration-300 ${
                  selectedTab === Tab.Accounts
                    ? "text-blue-500 border-blue-500"
                    : "text-gray-500 border-gray-200"
                }`}
              >
                Accounts
              </button>
              <button
                onClick={() => {
                  setSelectedTab(Tab.Addresses);
                }}
                className={`py-3 w-full flex items-center border-b justify-center hover:bg-gray-50 transition-all duration-300 ${
                  selectedTab === Tab.Addresses
                    ? "text-blue-500 border-blue-500"
                    : "text-gray-500 border-gray-200"
                }`}
              >
                Addresses
              </button>
              <button
                onClick={() => {
                  setSelectedTab(Tab.Others);
                }}
                className={`py-3 w-full flex items-center border-b justify-center hover:bg-gray-50 transition-all duration-300 ${
                  selectedTab === Tab.Others
                    ? "text-blue-500 border-blue-500"
                    : "text-gray-500 border-gray-200"
                }`}
              >
                Others
              </button>
            </div>
            <div className="w-full h-[448px] bg-white overflow-y-scroll p-6">
              <CurrentComponent />
            </div>
          </div>
          <div className="py-5 px-6 flex justify-end w-full bg-white gap-4">
            <div>
              <Button
                colorStyle="greySecondary"
                onClick={() => {
                  setModalOpen(false);
                  setFields(initialFields);
                }}
              >
                Cancel
              </Button>
            </div>
            <div>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  setInitialFields(fields);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const ManageNamePage: React.FC = () => {
  return (
    <FieldsProvider>
      <ManageNamePageContent />
    </FieldsProvider>
  );
};

export default ManageNamePage;
