import { Input } from "@ensdomains/thorin";
import React from "react";
import { Tab, useFields } from "./FieldsContext";

export const AddressesTab = () => {
  const { addressesFields, updateField } = useFields();

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        {addressesFields.map((field, index) => (
          <Input
            key={field.label}
            clearable
            label={field.label}
            placeholder={field.placeholder}
            type="text"
            value={field.value}
            onChange={(e) => updateField(Tab.Addresses, index, e.target.value)}
            error={
              field?.validationFunction &&
              !field?.validationFunction(field.value) &&
              "Invalid field"
            }
          />
        ))}
      </div>
    </div>
  );
};
