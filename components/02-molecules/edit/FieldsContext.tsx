import { Field, FieldType, Tab } from "@/types/editFieldsTypes";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { isAddress } from "viem";

interface FieldsContextType {
  fields: Record<Tab, Field[]>;
  initialFields: Record<Tab, Field[]>;
  setInitialFields: (fields: Record<Tab, Field[]>) => void;
  setFields: (fields: Record<Tab, Field[]>) => void;
  addField: (tab: Tab, fieldName: string) => void;
  updateField: (tab: Tab, index: number, newValue: string) => void;
}

interface FieldsProviderProps {
  children: ReactNode;
}

const FieldsContext = createContext<FieldsContextType | undefined>(undefined);

const FieldsProvider: React.FC<FieldsProviderProps> = ({ children }) => {
  const [fields, setFieldsState] = useState<Record<Tab, Field[]>>({
    [Tab.Profile]: [
      {
        label: "url",
        placeholder: "https://coolcats.com",
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
        validationFunction: () => {
          const fieldValue: undefined | string = fields[Tab.Addresses].find(
            (add: Field) => add.label === "ETH"
          )?.value;
          const fieldIsEmpty: boolean = !fieldValue;
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
          validationFunction: () => {
            const fieldValue: undefined | string = fields[Tab.Addresses].find(
              (address: Field) => address.label === "ETH"
            )?.value;
            const fieldIsEmpty: boolean = !fieldValue;
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
    const deepCopiedFields = Object.assign({}, fields);
    setInitialFieldsState(deepCopiedFields);
  };

  const setFields = (fields: Record<Tab, Field[]>) => {
    const deepCopiedFields = Object.assign({}, fields);
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
