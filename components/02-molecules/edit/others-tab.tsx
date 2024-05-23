"use client";

import { Button, Input } from "@ensdomains/thorin";
import React from "react";
import { Tab, useFields } from "./FieldsContext";

const OthersTab = () => {
  const { fields, addField, updateField } = useFields();
  const othersFields = fields[Tab.Others];

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        {othersFields.map((field, index) => (
          <Input
            key={field.label}
            clearable
            label={field.label}
            placeholder={field.placeholder}
            type="text"
            value={field.value}
            onChange={(e) => updateField(Tab.Others, index, e.target.value)}
          />
        ))}
        <Button onClick={() => addField(Tab.Others)}>Add Field</Button>
      </div>
    </div>
  );
};

export default OthersTab;
