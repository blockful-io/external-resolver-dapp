import { Input } from "@ensdomains/thorin";
import React from "react";
import { Tab, useFields } from "./FieldsContext";
import { Field } from "@/types/editFieldsTypes";

export const OthersTab = () => {
  const { othersFields, updateField } = useFields();

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        {othersFields.map((field: Field, index: number) => (
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
      </div>
    </div>
  );
};
