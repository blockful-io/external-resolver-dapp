import { useState } from "react";
import {
  AccountsTab,
  AddressesTab,
  OthersTab,
  ProfileTab,
  Tab,
  useFields,
} from "../02-molecules";
import {
  Button,
  CheckCircleSVG,
  CounterClockwiseArrowSVG,
  InfoCircleSVG,
} from "@ensdomains/thorin";

const tabComponents: Record<Tab, React.FC> = {
  [Tab.Profile]: ProfileTab,
  [Tab.Accounts]: AccountsTab,
  [Tab.Addresses]: AddressesTab,
  [Tab.Others]: OthersTab,
};

interface EditModalContentProps {
  closeModal: () => void;
}

export const EditModalContent = ({ closeModal }: EditModalContentProps) => {
  const [selectedTab, setSelectedTab] = useState(Tab.Profile);
  const [isSaving, setIsSaving] = useState(false);
  const [recordsEdited, setRecordsEdited] = useState(false);
  const CurrentComponent = tabComponents[selectedTab];

  const { fields, initialFields, setInitialFields, setFields } = useFields();

  if (recordsEdited) {
    return (
      <RecordsEdited
        back={() => {
          setIsSaving(false);
          closeModal();
        }}
      />
    );
  }

  if (isSaving) {
    return (
      <SaveModalEdits
        nextStep={() => {
          setRecordsEdited(true);
        }}
        back={() => {
          setIsSaving(false);
        }}
      />
    );
  }

  return (
    <div className="w-[480px] border rounded-xl overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="py-5 px-6 flex justify-between w-full bg-gray-50 border-b font-semibold text-black">
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
              closeModal();
              setFields(initialFields);
            }}
          >
            Cancel
          </Button>
        </div>
        <div>
          <Button
            onClick={() => {
              setIsSaving(true);
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SaveModalEditsProps {
  back: () => void;
  nextStep: () => void;
}

const SaveModalEdits = ({ back, nextStep }: SaveModalEditsProps) => {
  return (
    <div className="w-[480px] border rounded-xl overflow-hidden bg-white">
      <div className="py-5 px-6 flex justify-between w-full bg-gray-50 border-b font-semibold text-black">
        Edit Records
      </div>

      <div className="w-full gap-6 flex flex-col bg-white overflow-y-scroll p-6 border-b border-gray-200">
        <div className="text-[18px] text-gray-400">
          Check your information before confirming in your wallet
        </div>

        <div className="flex flex-col rounded-md border border-gray-200 overflow-hidden">
          <div className="flex justify-between w-full border-b border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <CheckCircleSVG className="w-4 h-4 text-gray-400" />
              <p className="text-gray-400">Domain</p>
            </div>

            <div className="flex items-center gap-2">
              <p className="">coolcats.eth</p>
            </div>
          </div>

          <div className="flex justify-between w-full border-b border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <CounterClockwiseArrowSVG className="w-4 h-4 text-gray-400" />
              <p className="text-gray-400">Action</p>
            </div>

            <div className="flex items-center gap-2">
              <p className="">Update records</p>
            </div>
          </div>

          <div className="flex justify-between w-full p-3">
            <div className="flex items-center gap-2">
              <InfoCircleSVG className="w-4 h-4 text-gray-400" />
              <p className="text-gray-400">Subname</p>
            </div>

            <div className="flex items-center gap-2">
              <p className="">coolcats.channel</p>
            </div>
          </div>
        </div>

        <div className="w-full">
          <Button onClick={nextStep} colorStyle="bluePrimary">
            Open Wallet
          </Button>
        </div>
      </div>

      <div className="py-5 px-6 flex justify-end w-full bg-white gap-4">
        <div>
          <Button colorStyle="greySecondary" onClick={back}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

interface RecordsEditedProps {
  back: () => void;
}

const RecordsEdited = ({ back }: RecordsEditedProps) => {
  return (
    <div className="w-[480px] border rounded-xl overflow-hidden bg-white">
      <div className="py-5 px-6 flex justify-between w-full bg-gray-50 border-b font-semibold text-black">
        Edit Records
      </div>

      <div className="w-full gap-6 flex flex-col items-center justify-center bg-white overflow-y-scroll p-6 border-b border-gray-200">
        <div className="text-7xl text-gray-400">🎉</div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-[26px] font-semibold">Records edited!</p>
          <p className="text-gray-400">
            Your transaction was successfully completed.
          </p>
        </div>
      </div>

      <div className="py-5 px-6 flex justify-end w-full bg-white gap-4">
        <div>
          <Button colorStyle="bluePrimary" onClick={back}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

// const getChangedFields = (
//   currentFields: Record<Tab, Field[]>,
//   initialFields: Record<Tab, Field[]>
// ) => {
//   const changes: Record<
//     Tab,
//     { added: Field[]; changed: { index: number; field: Field }[] }
//   > = {} as Record<
//     Tab,
//     { added: Field[]; changed: { index: number; field: Field }[] }
//   >;

//   Object.entries(currentFields).forEach(([tab, currentTabFields]) => {
//     const tabKey = tab as unknown as Tab; // Cast the key to the Tab type through unknown
//     const initialTabFields = initialFields[tabKey] || [];

//     const addedFields = currentTabFields.slice(initialTabFields.length);
//     const changedFields = currentTabFields
//       .slice(0, initialTabFields.length)
//       .map((field, index) => ({
//         index,
//         field,
//       }))
//       .filter(
//         ({ field, index }) => field.value !== initialTabFields[index]?.value
//       );

//     if (addedFields.length > 0 || changedFields.length > 0) {
//       changes[tabKey] = {
//         added: addedFields,
//         changed: changedFields,
//       };
//     }
//   });

//   return changes;
// };
