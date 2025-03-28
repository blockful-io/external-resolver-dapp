import { useEffect, useState } from "react";
import {
  AccountsTab,
  AddressesTab,
  OthersTab,
  ProfileTab,
  Tab,
  useFields,
} from "@/components/molecules";
import {
  Button,
  CheckCircleSVG,
  CounterClockwiseArrowSVG,
  InfoCircleSVG,
} from "@ensdomains/thorin";
import { useRouter } from "next/router";
import { Field } from "@/types/editFieldsTypes";
import { BlockchainCTA } from "@/components/atoms";
import { Address, Hash, TransactionReceipt } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import cc from "classcat";
import { WalletClientWithAccount } from "ensjs-monorepo/packages/ensjs/dist/types/contracts/consts";
import { setRecords } from "ensjs-monorepo/packages/ensjs/dist/esm/wallet";

const tabComponents: Record<Tab, React.FC> = {
  [Tab.Profile]: ProfileTab,
  [Tab.Accounts]: AccountsTab,
  [Tab.Addresses]: AddressesTab,
  [Tab.Others]: OthersTab,
};

interface EditModalContentProps {
  closeModal: () => void;
  onRecordsEdited?: () => void;
  resolverAddress: Address;
}

export const EditModalContent = ({
  closeModal,
  onRecordsEdited,
  resolverAddress,
}: EditModalContentProps) => {
  const [selectedTab, setSelectedTab] = useState(Tab.Profile);
  const [isSaving, setIsSaving] = useState(false);
  const [recordsEdited, setRecordsEdited] = useState(false);
  const CurrentComponent = tabComponents[selectedTab];

  const [changedFields, setChangedFields] = useState<Field[]>([]);

  const {
    profileFields,
    accountsFields,
    addressesFields,
    othersFields,
    initialProfileFields,
    initialAddressesFields,
    initialAccountsFields,
    initialOthersFields,
    setFields,
  } = useFields();

  useEffect(() => {
    const changedFieldsKeys: Field[] = [];

    Object.values(profileFields).forEach((field) => {
      const initialProfileField = initialProfileFields.find(
        ({ label }) => label === field.label,
      ) ?? { value: "" };
      if (field.value !== initialProfileField.value) {
        changedFieldsKeys.push(field);
      }
    });
    Object.values(accountsFields).forEach((field) => {
      const initialAccountField = initialAccountsFields.find(
        ({ label }) => label === field.label,
      ) ?? { value: "" };
      if (field.value !== initialAccountField.value) {
        changedFieldsKeys.push(field);
      }
    });
    Object.values(addressesFields).forEach((field) => {
      const initialAddressField = initialAddressesFields.find(
        ({ label }) => label === field.label,
      ) ?? { value: "" };
      if (field.value !== initialAddressField.value) {
        changedFieldsKeys.push(field);
      }
    });

    Object.values(othersFields).forEach((field) => {
      const initialOthersField = initialOthersFields.find(
        ({ label }) => label === field.label,
      ) ?? { value: "" };
      if (field.value !== initialOthersField.value) {
        changedFieldsKeys.push(field);
      }
    });
    setChangedFields(changedFieldsKeys);
  }, [profileFields, accountsFields, addressesFields, othersFields]);

  const hasAnyInvalidField = () => {
    const invalidProfileField = Object.values(profileFields)
      .flatMap((fields) => fields)
      .some(
        (field) =>
          field.validationFunction &&
          field.validationFunction(field.value) === false,
      );
    const invalidAddressesField = Object.values(addressesFields)
      .flatMap((fields) => fields)
      .some(
        (field) =>
          field.validationFunction &&
          field.validationFunction(field.value) === false,
      );
    const invalidAccountsField = Object.values(accountsFields)
      .flatMap((fields) => fields)
      .some(
        (field) =>
          field.validationFunction &&
          field.validationFunction(field.value) === false,
      );
    return invalidProfileField || invalidAddressesField || invalidAccountsField;
  };

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
        resolverAddress={resolverAddress}
        changedFields={changedFields}
        nextStep={() => {
          onRecordsEdited && onRecordsEdited();
          setRecordsEdited(true);
        }}
        back={() => {
          setIsSaving(false);
        }}
      />
    );
  }

  return (
    <div className="w-[580px] overflow-hidden rounded-xl border">
      <div className="border-b border-gray-200">
        <div className="flex w-full justify-between border-b bg-gray-50 px-6 py-5 font-semibold text-black">
          Edit Records
        </div>
        <div className="flex w-full justify-around bg-white">
          <button
            onClick={() => {
              setSelectedTab(Tab.Profile);
            }}
            className={cc([
              "flex w-full items-center justify-center border-b py-3 transition-all duration-300 hover:bg-gray-50",
              {
                "border-blue-500 text-blue-500": selectedTab === Tab.Profile,
                "border-gray-200 text-gray-500": selectedTab !== Tab.Profile,
              },
            ])}
          >
            Profile
          </button>
          <button
            onClick={() => {
              setSelectedTab(Tab.Accounts);
            }}
            className={cc([
              "flex w-full items-center justify-center border-b py-3 transition-all duration-300 hover:bg-gray-50",
              {
                "border-blue-500 text-blue-500": selectedTab === Tab.Accounts,
                "border-gray-200 text-gray-500": selectedTab !== Tab.Accounts,
              },
            ])}
          >
            Accounts
          </button>
          <button
            onClick={() => {
              setSelectedTab(Tab.Addresses);
            }}
            className={cc([
              "flex w-full items-center justify-center border-b py-3 transition-all duration-300 hover:bg-gray-50",
              {
                "border-blue-500 text-blue-500": selectedTab === Tab.Addresses,
                "border-gray-200 text-gray-500": selectedTab !== Tab.Addresses,
              },
            ])}
          >
            Addresses
          </button>
          <button
            onClick={() => {
              setSelectedTab(Tab.Others);
            }}
            className={`flex w-full items-center justify-center border-b py-3 transition-all duration-300 hover:bg-gray-50 ${
              selectedTab === Tab.Others
                ? "border-blue-500 text-blue-500"
                : "border-gray-200 text-gray-500"
            }`}
          >
            Others
          </button>
        </div>
        <div className="h-[448px] w-full overflow-y-scroll bg-white p-6">
          <CurrentComponent />
        </div>
      </div>
      <div className="flex w-full justify-end gap-4 bg-white px-6 py-5">
        {/* {!!invalidFieldsKeys.length && (
          <div className="flex flex-col text-sm mr-auto">
            <p className="text-red-400 font-semibold">
              Invalid values for fields:
            </p>
            <ul>
              {invalidFieldsKeys.map((field) => (
                <li key={field} className="flex items-center space-x-2">
                  <span className="w-1 h-1 rounded-full bg-red-400"></span>
                  <p className="text-red-400">{field}</p>
                </li>
              ))}
            </ul>
          </div>
        )} */}

        <div>
          <Button
            colorStyle="greySecondary"
            onClick={() => {
              closeModal();
              setFields(Tab.Profile, initialProfileFields);
              setFields(Tab.Addresses, initialAddressesFields);
              setFields(Tab.Accounts, initialAccountsFields);
            }}
          >
            Cancel
          </Button>
        </div>
        <div>
          <Button
            disabled={hasAnyInvalidField() || !changedFields.length}
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
  changedFields: Field[];
  resolverAddress: Address;
}

const SaveModalEdits = ({
  back,
  nextStep,
  changedFields,
  resolverAddress,
}: SaveModalEditsProps) => {
  const router = useRouter();
  const { address, chain } = useAccount();
  const walletClient = useWalletClient({
    chainId: chain?.id,
  });
  const { textRecordsToUpdate, domainAddressesToUpdate, othersFieldsToUpdate } =
    useFields();

  async function setTextRecords(): Promise<Hash> {
    const texts = Object.entries(textRecordsToUpdate).map(([key, value]) => ({
      key,
      value,
    }));

    const coins = Object.entries(domainAddressesToUpdate).map(
      ([coin, value]) => ({
        coin,
        value,
      }),
    );

    const contentHash = Object.entries(othersFieldsToUpdate).reduce(
      (_, [, value]) => value,
      "",
    );

    return await setRecords(walletClient.data! as WalletClientWithAccount, {
      name: router.query.name as string,
      coins,
      texts,
      account: address!,
      resolverAddress,
      contentHash: contentHash || undefined, // avoid sending empty string
    });
  }

  return (
    <div className="w-[580px] overflow-hidden rounded-xl border bg-white">
      <div className="flex w-full justify-between border-b bg-gray-50 px-6 py-5 font-semibold text-black">
        Edit Records
      </div>

      <div className="flex w-full flex-col gap-6 overflow-y-scroll border-b border-gray-200 bg-white p-6">
        <div className="text-[18px] text-gray-400">
          Check your information before confirming in your wallet
        </div>

        <div className="flex flex-col overflow-hidden rounded-md border border-gray-200">
          <div className="flex w-full justify-between border-b border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <CheckCircleSVG className="h-4 w-4 text-gray-400" />
              <p className="text-gray-400">Domain</p>
            </div>

            <div className="flex items-center gap-2 font-semibold text-gray-400">
              <p className="">{router.query.name}</p>
            </div>
          </div>

          <div className="flex w-full justify-between border-b border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <CounterClockwiseArrowSVG className="h-4 w-4 text-gray-400" />
              <p className="text-gray-400">Action</p>
            </div>

            <div className="flex items-center gap-2 font-semibold text-gray-400">
              <p className="">Update records</p>
            </div>
          </div>

          <div className="flex w-full items-start justify-between p-3">
            <div className="flex items-center gap-2">
              <InfoCircleSVG className="h-4 w-4 text-gray-400" />
              <p className="text-gray-400">New records</p>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <ul className="flex w-full flex-col space-y-2">
                {changedFields.map((field) => (
                  <li
                    key={field.label}
                    className="flex w-full justify-between space-x-6"
                  >
                    <p>{field.label}</p>
                    <p className="max-w-32 truncate font-semibold">
                      {field.value}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="w-full">
          <BlockchainCTA
            onSuccess={(_: TransactionReceipt) => nextStep()}
            transactionRequest={setTextRecords}
          />
        </div>
      </div>

      <div className="flex w-full justify-end gap-4 bg-white px-6 py-5">
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
    <div className="w-[480px] overflow-hidden rounded-xl border bg-white">
      <div className="flex w-full justify-between border-b bg-gray-50 px-6 py-5 font-semibold text-black">
        Edit Records
      </div>

      <div className="flex w-full flex-col items-center justify-center gap-6 overflow-y-scroll border-b border-gray-200 bg-white p-6">
        <div className="text-7xl text-gray-400">🎉</div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-[26px] font-semibold">Records edited!</p>
          <p className="text-gray-400">
            Your transaction was successfully completed.
          </p>
        </div>
      </div>

      <div className="flex w-full justify-end gap-4 bg-white px-6 py-5">
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
