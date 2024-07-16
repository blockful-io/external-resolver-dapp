export type Field = {
  label: string;
  value: string;
  fieldType: FieldType;
  placeholder?: string;
  validationFunction?: (fieldValue: string) => boolean;
};

export enum FieldType {
  Address = "Address",
  Text = "Text",
  TextArea = "TextArea",
}

export enum Tab {
  Profile,
  Accounts,
  Addresses,
  // Others,
}
