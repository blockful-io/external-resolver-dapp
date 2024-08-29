import { FieldType, Tab } from "@/types/editFieldsTypes";
import { Input, Textarea } from "@ensdomains/thorin";
import React from "react";
import { useFields } from "./FieldsContext";
import Avatar from "boring-avatars";

export const ProfileTab = () => {
  const { profileFields, updateField } = useFields();

  return (
    <div className="w-full">
      <div className="w-full h-[120px] bg-gradient-ens rounded-xl flex items-end justify-center">
        <div className="rounded-lg translate-y-6 border-2 border-white overflow-hidden">
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
