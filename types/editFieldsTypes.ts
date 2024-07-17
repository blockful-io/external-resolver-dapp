export type Field = {
  label: string;
  value: string;
  fieldType: FieldType;
  placeholder?: string;
  validationFunction?: (fieldValue: string) => boolean;
};

// Used to differentiate setAddr and setText fields
export enum FieldType {
  Address = "Address",
  Text = "Text",
}

export enum Tab {
  Profile,
  Accounts,
  Addresses,
  // Others,
}
