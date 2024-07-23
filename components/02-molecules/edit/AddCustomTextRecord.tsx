import { Button, CheckSVG, CrossSVG, Input } from "@ensdomains/thorin";
import React, { useState } from "react";
import { Tab, useFields } from "./FieldsContext";

enum ButtonType {
  ADD_RECORD,
  ADDING_RECORD,
}

interface AddCustomTextRecordProps {
  tab: Tab;
}

const AddCustomTextRecord = ({ tab }: AddCustomTextRecordProps) => {
  const [buttonType, setButtonType] = useState(ButtonType.ADD_RECORD);
  const [fieldName, setFieldName] = useState("");
  const { addProfileField, addAccountField, addAddressField } = useFields();

  const handleAddField = () => {
    switch (tab) {
      case Tab.Profile:
        addProfileField(fieldName)
        break;
      case Tab.Accounts:
        addAccountField(fieldName);
        break;
      case Tab.Addresses:
        addAddressField(fieldName);
        break;
      default:
        break;
    }
    setButtonType(ButtonType.ADD_RECORD);
  };

  if (buttonType === ButtonType.ADD_RECORD) {
    return (
      <div className="w-full">
        <Button onClick={() => setButtonType(ButtonType.ADDING_RECORD)}>
          Add Custom
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex gap-4 items-center justify-center">
      <Input
        hideLabel
        label=""
        value={fieldName}
        onChange={(e) => setFieldName(e.target.value)}
      />
      <div className="flex rounded-lg border border-gray-200">
        <button
          onClick={() => {
            setButtonType(ButtonType.ADD_RECORD);
          }}
          className="p-4"
        >
          <CrossSVG className="w-4 h-4 text-gray-400" />
        </button>
        <button
          onClick={handleAddField}
          className="p-4 border-l border-gray-200"
        >
          <CheckSVG className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default AddCustomTextRecord;
