"use client";

import { Tab } from "@/types/editTypes";
import { Input, Textarea } from "@ensdomains/thorin";
import Image from "next/image";
import React from "react";
import { useFields } from "./FieldsContext";

export const ProfileTab = () => {
  const { fields, updateField } = useFields();
  const profileFields = fields[Tab.Profile];

  return (
    <div className="w-full">
      <div className="w-full h-[120px] bg-gradient-ens rounded-[12px] flex items-end justify-center">
        <Image
          width={80}
          height={80}
          alt="user avatar"
          src="/coolcat.avif"
          className="rounded-[8px] translate-y-6 border-2 border-white"
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-6 w-full"></div>
        {profileFields.map((field, index) => (
          <Input
            key={field.label}
            clearable
            label={field.label}
            placeholder={field.placeholder}
            type={"text"}
            value={field.value}
            onChange={(e) => updateField(Tab.Profile, index, e.target.value)}
          />
        ))}
        <Textarea
          clearable
          label="Description"
          placeholder="Share your story…"
        />
      </div>
    </div>
  );
};
