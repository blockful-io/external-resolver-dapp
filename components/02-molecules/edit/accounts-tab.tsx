import { Input, Button } from "@ensdomains/thorin";
import React from "react";
import { useFields, Tab } from "./FieldsContext";
import AddCustomTextRecord from "./AddCustomTextRecord";

const AccountsTab: React.FC = () => {
  const { fields, updateField } = useFields();
  const accountsFields = fields[Tab.Accounts];

  return (
    <div className="w-full">
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

export default AccountsTab;
