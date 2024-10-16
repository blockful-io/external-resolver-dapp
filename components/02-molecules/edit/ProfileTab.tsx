import { FieldType, Tab } from "@/types/editFieldsTypes";
import { Input, Textarea } from "@ensdomains/thorin";
import React from "react";
import { useFields } from "./FieldsContext";
import Avatar from "boring-avatars";

export const ProfileTab = () => {
  const { profileFields, updateField } = useFields();

  return (
    <div className="w-full">
      <div className="flex h-[120px] w-full items-end justify-center rounded-xl bg-gradient-ens">
        <div className="translate-y-6 overflow-hidden rounded-lg border-2 border-white">
          <Avatar
            size={80}
            square
            name="Margaret Bourke"
            variant="beam"
            colors={["#44BCF0", "#7298F8", "#A099FF", "#FFFFFF"]}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-6 w-full"></div>
        {profileFields.map((field, index) => {
          return field.fieldType === FieldType.Text ? (
            <Input
              key={field.label}
              clearable
              label={field.label}
              placeholder={field.placeholder}
              type="text"
              value={field.value}
              onChange={(e) => updateField(Tab.Profile, index, e.target.value)}
            />
          ) : (
            <Textarea
              clearable
              label={field.label}
              placeholder={field.placeholder}
              value={field.value}
              onChange={(e) => updateField(Tab.Profile, index, e.target.value)}
            />
          );
        })}
      </div>
    </div>
  );
};
