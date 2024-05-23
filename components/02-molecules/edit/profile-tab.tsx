"use client";

import { Input, Textarea } from "@ensdomains/thorin";
import Image from "next/image";
import React from "react";

const ProfileTab = () => {
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
        <Input
          clearable
          label="Website"
          placeholder="https://coolcats.com"
          type="text"
        />
        <Textarea
          clearable
          label="Description"
          placeholder="Share your story…"
        />
      </div>
    </div>
  );
};

export default ProfileTab;
