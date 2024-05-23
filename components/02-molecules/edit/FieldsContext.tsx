import { Field, Tab } from "@/types/editTypes";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface FieldsContextType {
  fields: Record<Tab, Field[]>;
  addField: (tab: Tab) => void;
  updateField: (tab: Tab, index: number, newValue: string) => void;
}

interface FieldsProviderProps {
  children: ReactNode;
}

const FieldsContext = createContext<FieldsContextType | undefined>(undefined);

const FieldsProvider: React.FC<FieldsProviderProps> = ({ children }) => {
  const [fields, setFields] = useState<Record<Tab, Field[]>>({
    [Tab.Profile]: [
      { label: "Website", placeholder: "https://coolcats.com", value: "" },
    ],
    [Tab.Accounts]: [
      { label: "Email", placeholder: "mail@mail.com", value: "" },
      { label: "Twitter", placeholder: "@twitter", value: "" },
      { label: "Linkedin", placeholder: "/linkedin", value: "" },
    ],
    [Tab.Addresses]: [
      { label: "ETH", placeholder: "mail@mail.com", value: "" },
    ],
    [Tab.Others]: [
      { label: "Content hash", placeholder: "", value: "" },
      { label: "ABI", placeholder: "", value: "" },
    ],
  });

  const addField = (tab: Tab) => {
    const newField: Field = {
      label: `Field ${fields[tab].length + 1}`,
      placeholder: "",
      value: "",
    };
    setFields((prevFields) => ({
      ...prevFields,
      [tab]: [...prevFields[tab], newField],
    }));
  };

  const updateField = (tab: Tab, index: number, newValue: string) => {
    const updatedFields = [...fields[tab]];
    updatedFields[index].value = newValue;
    setFields((prevFields) => ({
      ...prevFields,
      [tab]: updatedFields,
    }));
  };

  return (
    <FieldsContext.Provider value={{ fields, addField, updateField }}>
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
