import { Field, FieldType, Tab } from "@/types/editFieldsTypes";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { isAddress } from "viem";
import _ from "lodash";
import validateBitcoinAddress from "bitcoin-address-validation";
import { DomainData } from "@/lib/domain-page";

interface FieldsContextType {
  profileFields: Field[];
  initialProfileFields: Field[];
  accountsFields: Field[];
  initialAccountsFields: Field[];
  addressesFields: Field[];
  initialAddressesFields: Field[];
  addField: (tab: Tab, fieldName: string) => void;
  setFields: (tab: Tab, fields: Field[]) => void;
  setInitialFields: (tab: Tab, fields: Field[]) => void;
  updateField: (tab: Tab, index: number, newValue: string) => void;
  domainAddressesToUpdate: Record<string, string>;
  textRecordsToUpdate: Record<string, string>;
  updateEditModalFieldsWithEnsData: (ensData: DomainData | null) => void;
}

interface FieldsProviderProps {
  children: ReactNode;
}

const FieldsContext = createContext<FieldsContextType | undefined>(undefined);

const FieldsProvider: React.FC<FieldsProviderProps> = ({ children }) => {
  const [textRecordsToUpdate, setTextRecordsToUpdate] = useState<
    Record<string, string>
  >({});
  const [domainAddressesToUpdate, setDomainAddressesToUpdate] = useState<
    Record<string, string>
  >({});

  // PROFILE TAB
  const [profileFields, setProfileFieldsState] = useState<Field[]>([
    {
      label: "url",
      placeholder: "https://coolcats.com",
      value: "",
      fieldType: FieldType.Text,
    },
    {
      label: "description",
      placeholder: "Share your story…",
      value: "",
      fieldType: FieldType.Text,
    },
  ]);

  const setFields = (tab: Tab, fields: Field[]) => {
    const setStateByTab = {
      [Tab.Profile]: setProfileFieldsState,
      [Tab.Accounts]: setAccountsFieldsState,
      [Tab.Addresses]: setAddressesFieldsState,
    };
    const deepCopiedFields = _.cloneDeep(fields);
    setStateByTab[tab](deepCopiedFields);
  };

  const updateField = (tab: Tab, index: number, newValue: string) => {
    const fieldsByTab = {
      [Tab.Profile]: [...profileFields],
      [Tab.Accounts]: [...accountsFields],
      [Tab.Addresses]: [...addressesFields],
    };
    const setStateByTab = {
      [Tab.Profile]: setProfileFieldsState,
      [Tab.Accounts]: setAccountsFieldsState,
      [Tab.Addresses]: setAddressesFieldsState,
    };
    const updatedFields = fieldsByTab[tab];
    updatedFields[index].value = newValue;

    if (updatedFields[index].fieldType === FieldType.Address) {
      setDomainAddressesToUpdate({
        ...domainAddressesToUpdate,
        [updatedFields[index].label]: newValue,
      });
    } else if (updatedFields[index].fieldType === FieldType.Text) {
      setTextRecordsToUpdate({
        ...textRecordsToUpdate,
        [updatedFields[index].label]: newValue,
      });
    }
    setStateByTab[tab](updatedFields);
  };

  const addField = (tab: Tab, fieldName: string) => {
    const setStateByTab = {
      [Tab.Profile]: setProfileFieldsState,
      [Tab.Accounts]: setAccountsFieldsState,
      [Tab.Addresses]: setAddressesFieldsState,
    };
    const newField: Field = {
      label: fieldName,
      placeholder: "",
      value: "",
      fieldType: FieldType.Text,
    };
    setStateByTab[tab]((prevFields) => [...prevFields, newField]);
  };

  // INITIAL PROFILE STATE
  const [initialProfileFields, setInitialProfileFieldsState] = useState<
    Field[]
  >([
    {
      label: "url",
      placeholder: "https://coolcats.com",
      value: "",
      fieldType: FieldType.Text,
    },
    {
      label: "description",
      placeholder: "Share your story…",
      value: "",
      fieldType: FieldType.Text,
    },
  ]);

  const setInitialFields = (tab: Tab, fields: Field[]) => {
    const setInitialFieldsByTab = {
      [Tab.Profile]: setInitialProfileFieldsState,
      [Tab.Accounts]: setInitialAccountsFieldsState,
      [Tab.Addresses]: setInitialAddressesFieldsState,
    };
    const deepCopiedFields = _.cloneDeep(fields);
    setInitialFieldsByTab[tab](deepCopiedFields);
  };

  // ACCOUNTS TAB
  const [accountsFields, setAccountsFieldsState] = useState<Field[]>([
    {
      label: "email",
      placeholder: "mail@mail.com",
      value: "",
      fieldType: FieldType.Text,
    },
    {
      label: "com.twitter",
      placeholder: "@twitter",
      value: "",
      fieldType: FieldType.Text,
    },
    {
      label: "com.linkedin",
      placeholder: "/linkedin",
      value: "",
      fieldType: FieldType.Text,
    },
  ]);

  // INITIAL ACCOUNTS STATE
  const [initialAccountsFields, setInitialAccountsFieldsState] = useState<
    Field[]
  >([
    {
      label: "email",
      placeholder: "mail@mail.com",
      value: "",
      fieldType: FieldType.Text,
    },
    {
      label: "com.twitter",
      placeholder: "@twitter",
      value: "",
      fieldType: FieldType.Text,
    },
    {
      label: "com.linkedin",
      placeholder: "/linkedin",
      value: "",
      fieldType: FieldType.Text,
    },
  ]);

  // ADDRESS TAB
  const [addressesFields, setAddressesFieldsState] = useState<Field[]>([
    {
      label: "eth",
      placeholder: "0x0000000000000000000000000000000000000000",
      fieldType: FieldType.Address,
      value: "",
      validationFunction: (fieldValue: string) => {
        const fieldIsEmpty: Readonly<boolean> = fieldValue === "";
        const isValidAddress: Readonly<boolean> = !!isAddress(fieldValue);

        return fieldIsEmpty || isValidAddress;
      },
    } as Field,
    {
      label: "btc",
      placeholder: "bc1000000000000000000000000000000000000000",
      fieldType: FieldType.Address,
      value: "",
      validationFunction: (fieldValue: string) => {
        const fieldIsEmpty: Readonly<boolean> = fieldValue === "";
        const isValidAddress: Readonly<boolean> =
          !!validateBitcoinAddress(fieldValue);

        return fieldIsEmpty || isValidAddress;
      },
    } as Field,
    {
      label: "arb1",
      placeholder: "0x0000000000000000000000000000000000000000",
      fieldType: FieldType.Address,
      value: "",
      validationFunction: (fieldValue: string) => {
        const fieldIsEmpty: Readonly<boolean> = fieldValue === "";
        const isValidAddress: Readonly<boolean> = !!isAddress(fieldValue);
        return fieldIsEmpty || isValidAddress;
      },
    },
    {
      label: "op",
      placeholder: "0x0000000000000000000000000000000000000000",
      fieldType: FieldType.Address,
      value: "",
      validationFunction: (fieldValue: string) => {
        const fieldIsEmpty: Readonly<boolean> = fieldValue === "";
        const isValidAddress: Readonly<boolean> = !!isAddress(fieldValue);
        return fieldIsEmpty || isValidAddress;
      },
    },
    // Matic is not working
    // {
    //   label: "matic",
    //   placeholder: "0x0000000000000000000000000000000000000000",
    //   fieldType: FieldType.Address,
    //   value: "",
    //   validationFunction: (fieldValue: string) => {
    //     const fieldIsEmpty: Readonly<boolean> = fieldValue === "";
    //     const isValidAddress: Readonly<boolean> = !!isAddress(fieldValue);
    //     return fieldIsEmpty || isValidAddress;
    //   },
    // },
  ]);

  // INITIAL ADDRESS STATE
  const [initialAddressesFields, setInitialAddressesFieldsState] = useState<
    Field[]
  >([
    {
      label: "eth",
      placeholder: "0x0000000000000000000000000000000000000000",
      fieldType: FieldType.Address,
      value: "",
      validationFunction: (fieldValue: string) => {
        const fieldIsEmpty: boolean = fieldValue === "";
        const isAddressValid: boolean = !!isAddress(fieldValue);

        return fieldIsEmpty || isAddressValid;
      },
    },
    {
      label: "btc",
      placeholder: "bc1000000000000000000000000000000000000000",
      fieldType: FieldType.Address,
      value: "",
      validationFunction: (fieldValue: string) => {
        const fieldIsEmpty: Readonly<boolean> = fieldValue === "";
        const isValidAddress: Readonly<boolean> =
          !!validateBitcoinAddress(fieldValue);
        return fieldIsEmpty || isValidAddress;
      },
    },
    {
      label: "arb1",
      placeholder: "0x0000000000000000000000000000000000000000",
      fieldType: FieldType.Address,
      value: "",
      validationFunction: (fieldValue: string) => {
        const fieldIsEmpty: Readonly<boolean> = fieldValue === "";
        const isValidAddress: Readonly<boolean> = !!isAddress(fieldValue);
        return fieldIsEmpty || isValidAddress;
      },
    },
    {
      label: "opt",
      placeholder: "0x0000000000000000000000000000000000000000",
      fieldType: FieldType.Address,
      value: "",
      validationFunction: (fieldValue: string) => {
        const fieldIsEmpty: Readonly<boolean> = fieldValue === "";
        const isValidAddress: Readonly<boolean> = !!isAddress(fieldValue);
        return fieldIsEmpty || isValidAddress;
      },
    },
    {
      label: "matic",
      placeholder: "0x0000000000000000000000000000000000000000",
      fieldType: FieldType.Address,
      value: "",
      validationFunction: (fieldValue: string) => {
        const fieldIsEmpty: Readonly<boolean> = fieldValue === "";
        const isValidAddress: Readonly<boolean> = !!isAddress(fieldValue);
        return fieldIsEmpty || isValidAddress;
      },
    },
  ]);

  const updateEditModalFieldsWithEnsData = (domainData: DomainData | null) => {
    if (!domainData) {
      console.warn("FieldsContext - updateFieldsWithEnsData - No ENS Data");
      return;
    }

    const { texts, addresses: domainAddresses } = domainData.resolver;
    if (!texts || _.isEmpty(texts)) {
      console.warn(
        "FieldsContext - updateFieldsWithEnsData - Empty ENS Data texts",
      );
    }
    const textsKeys = Object.keys(texts || {});

    // Update profile fields with corresponding text values
    const newProfileFields: Field[] = profileFields.map((field) => {
      return {
        ...field,
        value: String(texts[field.label] ?? ""),
      };
    });

    // Get the names of the coins from the addresses, or an empty array if no addresses exist
    const domainCoinNames = !domainAddresses
      ? []
      : domainAddresses.map((coin) => coin.label);

    // Populate address fields with ENS values or default to an empty string
    const populatedAddressFields = addressesFields.map((addressField) => {
      if (domainCoinNames.includes(addressField.label)) {
        // Find the ENS address matching the label
        const matchedAddress = domainAddresses.find(
          (domainAddress) => domainAddress.label === addressField.label,
        )?.address;

        // Use the found address or default to an empty string if undefined
        const resolvedAddress = matchedAddress || "";

        return {
          ...addressField,
          value: resolvedAddress,
        };
      }

      return {
        ...addressField,
        value: "",
      }; // Return the address field unchanged if no match is found
    });
    const newAccountsFields = accountsFields.map((field) => {
      return {
        ...field,
        value: String(texts[field.label] ?? ""),
      };
    });

    const newFieldsByTab = {
      [Tab.Profile]: newProfileFields,
      [Tab.Accounts]: newAccountsFields,
      [Tab.Addresses]: populatedAddressFields,
    };

    [Tab.Profile, Tab.Accounts, Tab.Addresses].forEach((tab) => {
      setFields(tab, newFieldsByTab[tab]);
      setInitialFields(tab, newFieldsByTab[tab]);
    });
  };

  return (
    <FieldsContext.Provider
      value={{
        profileFields,
        initialProfileFields,
        accountsFields,
        initialAccountsFields,
        addressesFields,
        initialAddressesFields,
        domainAddressesToUpdate,
        textRecordsToUpdate,
        updateEditModalFieldsWithEnsData,
        addField,
        updateField,
        setFields,
        setInitialFields,
      }}
    >
      {children}
    </FieldsContext.Provider>
  );
};

// Custom hook to use the fields context
const useFields = () => {
  const context = useContext(FieldsContext);
  if (context === undefined) {
    throw new Error("useFields must be used within a FieldsProvider");
  }
  return context;
};

export { FieldsProvider, useFields, Tab };
