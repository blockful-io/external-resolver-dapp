import { Input } from "@ensdomains/thorin";
import React from "react";
import { useFields, Tab } from "./FieldsContext";
import AddCustomTextRecord from "./AddCustomTextRecord";

export const AccountsTab: React.FC = () => {
  const { accountsFields, updateField } = useFields();

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col gap-4">
        {accountsFields.map((field, index) => (
          <Input
            key={field.label}
            clearable
            label={field.label}
            placeholder={field.placeholder}
            type="text"
            value={field.value}
            onChange={(e) => updateField(Tab.Accounts, index, e.target.value)}
          />
        ))}
        <AddCustomTextRecord tab={Tab.Accounts} />
      </div>
    </div>
  );
};
