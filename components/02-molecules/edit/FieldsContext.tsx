import { Field, FieldType, Tab } from "@/types/editFieldsTypes";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { isAddress } from "viem";
import _ from "lodash";

interface FieldsContextType {
  fields: Record<Tab, Field[]>;
  initialFields: Record<Tab, Field[]>;
  addField: (tab: Tab, fieldName: string) => void;
  setFields: (fields: Record<Tab, Field[]>) => void;
  setInitialFields: (fields: Record<Tab, Field[]>) => void;
  updateField: (tab: Tab, index: number, newValue: string) => void;
  domainAddressesToUpdate: Record<string, string>;
  textRecordsToUpdate: Record<string, string>;
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

  const [fields, setFieldsState] = useState<Record<Tab, Field[]>>({
    [Tab.Profile]: [
      {
        label: "url",
        placeholder: "https://coolcats.com",
        value: "",
        fieldType: FieldType.Text,
      } as Field,
      {
        label: "description",
        placeholder: "Share your story…",
        value: "",
        fieldType: FieldType.Text,
      } as Field,
    ],
    [Tab.Accounts]: [
      {
        label: "email",
        placeholder: "mail@mail.com",
        value: "",
        fieldType: FieldType.Text,
      } as Field,
      {
        label: "com.twitter",
        placeholder: "@twitter",
        value: "",
        fieldType: FieldType.Text,
      } as Field,
      {
        label: "com.linkedin",
        placeholder: "/linkedin",
        value: "",
        fieldType: FieldType.Text,
      } as Field,
    ],
    [Tab.Addresses]: [
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
    ],
    // [Tab.Others]: [
    //   {
    //     label: "Content hash",
    //     placeholder: "",
    //     value: "",
    //     fieldType: FieldType.Text,
    //   },
    //   { label: "ABI", placeholder: "", value: "", fieldType: FieldType.Text },
    // ],
  } as Record<Tab, Field[]>);

  const [initialFields, setInitialFieldsState] = useState<Record<Tab, Field[]>>(
    {
      [Tab.Profile]: [
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
      ],
      [Tab.Accounts]: [
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
      ],
      [Tab.Addresses]: [
        {
          label: "ETH",
          placeholder: "0x0000000000000000000000000000000000000000",
          value: "",
          fieldType: FieldType.Address,
          validationFunction: (fieldValue: string) => {
            const fieldIsEmpty: boolean = fieldValue === "";
            const isAddressValid: boolean =
              typeof fieldValue === "string" && !!isAddress(fieldValue);

            return fieldIsEmpty || isAddressValid;
          },
        },
      ],
      // [Tab.Others]: [
      //   {
      //     label: "Content hash",
      //     placeholder: "",
      //     value: "",
      //     fieldType: FieldType.Text,
      //   },
      //   { label: "ABI", placeholder: "", value: "", fieldType: FieldType.Text },
      // ],
    }
  );

  const setInitialFields = (fields: Record<Tab, Field[]>) => {
    const deepCopiedFields = _.cloneDeep(fields);
    setInitialFieldsState(deepCopiedFields);
  };

  const setFields = (fields: Record<Tab, Field[]>) => {
    const deepCopiedFields = _.cloneDeep(fields);
    setFieldsState(deepCopiedFields);
  };

  const addField = (tab: Tab, fieldName: string) => {
    const newField: Field = {
      label: fieldName,
      placeholder: "",
      value: "",
      fieldType: FieldType.Text,
    };
    setFieldsState((prevFields) => ({
      ...prevFields,
      [tab]: [...prevFields[tab], newField],
    }));
  };

  const updateField = (tab: Tab, index: number, newValue: string) => {
    const updatedFields = [...fields[tab]];
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

    setFieldsState((prevFields) => ({
      ...prevFields,
      [tab]: updatedFields,
    }));
  };

  return (
    <FieldsContext.Provider
      value={{
        fields,
        initialFields,
        setInitialFields,
        setFields,
        addField,
        updateField,
        domainAddressesToUpdate,
        textRecordsToUpdate,
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
