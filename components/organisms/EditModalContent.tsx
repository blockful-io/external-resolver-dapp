import { useEffect, useState } from "react";
import {
  AccountsTab,
  AddressesTab,
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
import { useRouter } from "next/router";
import { Field } from "@/types/editFieldsTypes";
import { BlockchainCTA } from "../01-atoms";
import { TransactionReceipt, isAddress } from "viem";
import {
  TransactionErrorType,
  getBlockchainTransactionError,
} from "@/lib/wallet/txError";
import { setDomainRecords } from "@/lib/utils/blockchain-txs";
import { buildENSName } from "@namehash/ens-utils";
import { getResolver } from "@ensdomains/ensjs/public";
import { publicClient } from "@/lib/wallet/wallet-config";
import { useAccount } from "wagmi";
import cc from "classcat";

const tabComponents: Record<Tab, React.FC> = {
  [Tab.Profile]: ProfileTab,
  [Tab.Accounts]: AccountsTab,
  [Tab.Addresses]: AddressesTab,
  // [Tab.Others]: OthersTab,
};

interface EditModalContentProps {
  closeModal: () => void;
}

export const EditModalContent = ({ closeModal }: EditModalContentProps) => {
  const [selectedTab, setSelectedTab] = useState(Tab.Profile);
  const [isSaving, setIsSaving] = useState(false);
  const [recordsEdited, setRecordsEdited] = useState(false);
  const CurrentComponent = tabComponents[selectedTab];

  const [changedFields, setChangedFields] = useState<Field[]>([]);

  const {
    profileFields,
    accountsFields,
    addressesFields,
    setProfileFields,
    initialProfileFields,
    setAddressesFields,
    initialAddressesFields,
    setAccountsFields,
    initialAccountsFields,
  } = useFields();

  useEffect(() => {
    const changedFieldsKeys: Field[] = [];

    Object.values(profileFields).forEach((field) => {
      if (!!field.value) {
        changedFieldsKeys.push(field);
      }
    });
    Object.values(accountsFields).forEach((field) => {
      if (!!field.value) {
        changedFieldsKeys.push(field);
      }
    });
    Object.values(addressesFields).forEach((field) => {
      if (!!field.value) {
        changedFieldsKeys.push(field);
      }
    });
    setChangedFields(changedFieldsKeys);
  }, [profileFields, accountsFields, addressesFields]);

  const hasAnyInvalidField = () => {
    const invalidProfileField = Object.values(profileFields)
      .flatMap((fields) => fields)
      .some(
        (field) =>
          field.validationFunction &&
          field.validationFunction(field.value) === false
      );
    const invalidAddressesField = Object.values(addressesFields)
      .flatMap((fields) => fields)
      .some(
        (field) =>
          field.validationFunction &&
          field.validationFunction(field.value) === false
      );
    const invalidAccountsField = Object.values(accountsFields)
      .flatMap((fields) => fields)
      .some(
        (field) =>
          field.validationFunction &&
          field.validationFunction(field.value) === false
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
        changedFields={changedFields}
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
            className={cc([
              "py-3 w-full flex items-center border-b justify-center hover:bg-gray-50 transition-all duration-300",
              {
                "text-blue-500 border-blue-500": selectedTab === Tab.Profile,
                "text-gray-500 border-gray-200": selectedTab !== Tab.Profile
              }
            ])}
          >
            Profile
          </button>
          <button
            onClick={() => {
              setSelectedTab(Tab.Accounts);
            }}
            className={
              cc([
                "py-3 w-full flex items-center border-b justify-center hover:bg-gray-50 transition-all duration-300",
                {
                  "text-blue-500 border-blue-500": selectedTab === Tab.Accounts,
                  "text-gray-500 border-gray-200": selectedTab !== Tab.Accounts
                }
              ])
            }
          >
            Accounts
          </button>
          <button
            onClick={() => {
              setSelectedTab(Tab.Addresses);
            }}
            className={
              cc(["py-3 w-full flex items-center border-b justify-center hover:bg-gray-50 transition-all duration-300",
                {

                  "text-blue-500 border-blue-500": selectedTab === Tab.Addresses,
                  "text-gray-500 border-gray-200": selectedTab !== Tab.Addresses
                }
              ])
            }
          >
            Addresses
          </button>
          {/* <button
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
          </button> */}
        </div>
        <div className="w-full h-[448px] bg-white overflow-y-scroll p-6">
          <CurrentComponent />
        </div>
      </div>
      <div className="py-5 px-6 flex justify-end w-full bg-white gap-4">
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
              setProfileFields(initialProfileFields);
              setAddressesFields(initialAddressesFields);
              setAccountsFields(initialAccountsFields);
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
}

const SaveModalEdits = ({
  back,
  nextStep,
  changedFields,
}: SaveModalEditsProps) => {
  const router = useRouter();
  const { address } = useAccount();
  const { textRecordsToUpdate, domainAddressesToUpdate } = useFields();

  const setTextRecords = async (): Promise<
    `0x${string}` | TransactionErrorType | null
  > => {
    if (!address) {
      throw new Error(
        "Impossible to set the text records of a name without an authenticated user"
      );
    }

    if (!router.query.name || !buildENSName(router.query.name as string)) {
      throw new Error(
        "Impossible to set the text records of a name without a name"
      );
    }

    try {
      const ensName = buildENSName(router.query.name as string);
      const resolverAdd = await getResolver(publicClient, {
        name: ensName.name,
      });

      if (!resolverAdd || !isAddress(resolverAdd)) {
        throw new Error("Resolver not found");
      }

      const setDomainRecordsRes = await setDomainRecords({
        ensName,
        authenticatedAddress: address,
        domainResolverAddress: resolverAdd,
        textRecords: textRecordsToUpdate,
        addresses: domainAddressesToUpdate,
      });

      if (
        setDomainRecordsRes === null ||
        typeof setDomainRecordsRes === "number"
      ) {
        return null;
      } else {
        throw new Error(setDomainRecordsRes);
      }
    } catch (error) {
      console.error(error);
      const errorType = getBlockchainTransactionError(error);
      return errorType;
    }
  };

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

            <div className="flex items-center gap-2 text-gray-400 font-semibold">
              <p className="">{router.query.name}</p>
            </div>
          </div>

          <div className="flex justify-between w-full border-b border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <CounterClockwiseArrowSVG className="w-4 h-4 text-gray-400" />
              <p className="text-gray-400">Action</p>
            </div>

            <div className="flex items-center gap-2 text-gray-400 font-semibold">
              <p className="">Update records</p>
            </div>
          </div>

          <div className="flex justify-between items-start w-full p-3">
            <div className="flex items-center gap-2">
              <InfoCircleSVG className="w-4 h-4 text-gray-400" />
              <p className="text-gray-400">New records</p>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <ul className="w-full flex flex-col space-y-2">
                {changedFields.map((field) => (
                  <li
                    key={field.label}
                    className="w-full flex justify-between space-x-6"
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
            onSuccess={(txReceipt: TransactionReceipt) => {
              nextStep();
            }}
            transactionRequest={setTextRecords}
          />
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
