import { Field, FieldType, Tab } from "@/types/editFieldsTypes";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { isAddress } from "viem";
import _ from "lodash";
import { ResolvedEnsData, TextRecords } from "@/lib/utils/ensData";

interface FieldsContextType {
  profileFields: Field[];
  initialProfileFields: Field[];
  addProfileField: (fieldName: string) => void;
  setProfileFields: (fields: Field[]) => void;
  setInitialProfileFields: (fields: Field[]) => void;
  updateProfileField: (index: number, newValue: string) => void;
  accountsFields: Field[];
  initialAccountsFields: Field[];
  addAccountField: (fieldName: string) => void;
  setAccountsFields: (fields: Field[]) => void;
  setInitialAccountsFields: (fields: Field[]) => void;
  updateAccountField: (index: number, newValue: string) => void;
  addressesFields: Field[];
  initialAddressesFields: Field[];
  addAddressField: (fieldName: string) => void;
  setAddressesFields: (fields: Field[]) => void;
  setInitialAddressesFields: (fields: Field[]) => void;
  updateAddressField: (index: number, newValue: string) => void;
  domainAddressesToUpdate: Record<string, string>;
  textRecordsToUpdate: Record<string, string>;
  updateFieldsWithEnsData: (ensData: ResolvedEnsData | null) => void;
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
  ])

  const setProfileFields = (fields: Field[]) => {
    const deepCopiedFields = _.cloneDeep(fields);
    setProfileFieldsState(deepCopiedFields);
  };

  const updateProfileField = (index: number, newValue: string) => {
    const updatedFields = [...profileFields];
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
    setProfileFieldsState(updatedFields);
  };

  const addProfileField = (fieldName: string) => {
    const newField: Field = {
      label: fieldName,
      placeholder: "",
      value: "",
      fieldType: FieldType.Text,
    };
    setProfileFieldsState((prevFields) => [
      ...prevFields,
      newField,
    ]);
  };

  // INITIAL PROFILE STATE
  const [initialProfileFields, setInitialProfileFieldsState] = useState<Field[]>([
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
  ])

  const setInitialProfileFields = (fields: Field[]) => {
    const deepCopiedFields = _.cloneDeep(fields);
    setInitialProfileFieldsState(deepCopiedFields);
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
  ])

  const setAccountsFields = (fields: Field[]) => {
    const deepCopiedFields = _.cloneDeep(fields);
    setAccountsFieldsState(deepCopiedFields);
  };

  const updateAccountField = (index: number, newValue: string) => {
    const updatedFields = [...accountsFields];
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
    setProfileFieldsState(updatedFields);
  };


  const addAccountField = (fieldName: string) => {
    const newField: Field = {
      label: fieldName,
      placeholder: "",
      value: "",
      fieldType: FieldType.Text,
    };
    setAccountsFieldsState((prevFields) => [
      ...prevFields,
      newField,
    ]);
  };

  // INITIAL ACCOUNTS STATE
  const [initialAccountsFields, setInitialAccountsFieldsState] = useState<Field[]>([
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
  ])

  const setInitialAccountsFields = (fields: Field[]) => {
    const deepCopiedFields = _.cloneDeep(fields);
    setInitialAccountsFieldsState(deepCopiedFields);
  };


  //ADDRESS TAB
  const [addressesFields, setAddressesFieldsState] = useState<Field[]>([
    {
      label: "ETH",
      placeholder: "0x0000000000000000000000000000000000000000",
      fieldType: FieldType.Address,
      value: "",
      validationFunction: (fieldValue: string) => {
        const fieldIsEmpty: Readonly<boolean> = fieldValue === "";
        const isValidAddress: Readonly<boolean> =
          typeof fieldValue === "string" && !!isAddress(fieldValue);

        return fieldIsEmpty || isValidAddress;
      },
    } as Field,
  ])

  const setAddressesFields = (fields: Field[]) => {
    const deepCopiedFields = _.cloneDeep(fields);
    setAddressesFieldsState(deepCopiedFields);
  };

  const updateAddressField = (index: number, newValue: string) => {
    const updatedFields = [...addressesFields];
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
    setProfileFieldsState(updatedFields);
  };

  const addAddressField = (fieldName: string) => {
    const newField: Field = {
      label: fieldName,
      placeholder: "",
      value: "",
      fieldType: FieldType.Text,
    };
    setAddressesFieldsState((prevFields) => [
      ...prevFields,
      newField,
    ]);
  };

  //INITIAL ADDRESS STATE
  const [initialAddressesFields, setInitialAddressesFieldsState] = useState<Field[]>([
    {
      label: "ETH",
      placeholder: "0x0000000000000000000000000000000000000000",
      fieldType: FieldType.Address,
      value: "",
      validationFunction: (fieldValue: string) => {
        const fieldIsEmpty: boolean = fieldValue === "";
        const isAddressValid: boolean =
          typeof fieldValue === "string" && !!isAddress(fieldValue);

        return fieldIsEmpty || isAddressValid;
      },
    } as Field,
  ])

  const setInitialAddressesFields = (fields: Field[]) => {
    const deepCopiedFields = _.cloneDeep(fields);
    setInitialAddressesFieldsState(deepCopiedFields);
  };

  const updateFieldsWithEnsData = (ensData: ResolvedEnsData | null) => {
    if (!ensData) {
      console.warn("FieldsContext - updateFieldsWithEnsData - No ENS Data")
      return;
    }
    if (!ensData.texts || _.isEmpty(ensData.texts)) {
      console.warn("FieldsContext - updateFieldsWithEnsData - Empty ENS Data texts")
    }
    const keys = Object.keys(ensData.texts || {})
    const newProfileFields: Field[] = profileFields.map((field) => {
      if (keys.includes(field.label)) {
        return { ...field, value: (ensData.texts as TextRecords)[field.label] as string }
      }
      return field
    })
    const newAddressesFields = addressesFields.map((field) => {
      
      if (keys.includes(field.label)) {
        return { ...field, value: (ensData.texts as TextRecords)[field.label] as string }
      }
      return field
    })
    const newAccountsFields = accountsFields.map((field) => {
      if (keys.includes(field.label)) {
        return { ...field, value: (ensData.texts as TextRecords)[field.label] as string }
      }
      return field
    })
    setProfileFields(newProfileFields);
    setInitialProfileFields(newProfileFields);
    setAddressesFields(newAddressesFields);
    setInitialAddressesFields(newAddressesFields);
    setAccountsFields(newAccountsFields);
    setInitialAccountsFields(newAccountsFields);
  }

  return (
    <FieldsContext.Provider
      value={{
        profileFields,
        initialProfileFields,
        addProfileField,
        setProfileFields,
        setInitialProfileFields,
        updateProfileField,
        accountsFields,
        initialAccountsFields,
        addAccountField,
        setAccountsFields,
        setInitialAccountsFields,
        updateAccountField,
        addressesFields,
        initialAddressesFields,
        addAddressField,
        setAddressesFields,
        setInitialAddressesFields,
        updateAddressField,
        domainAddressesToUpdate,
        textRecordsToUpdate,
        updateFieldsWithEnsData,
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
