"use client";

import { Button, Input } from "@ensdomains/thorin";
import React from "react";
import { Tab, useFields } from "./FieldsContext";

const AddressesTab = () => {
  const { fields, addField, updateField } = useFields();
  const addressesFields = fields[Tab.Addresses];

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
          />
        ))}
        <Button onClick={() => addField(Tab.Addresses)}>Add Field</Button>
      </div>
    </div>
  );
};

export default AddressesTab;
