"use client";

import { Input } from "@ensdomains/thorin";
import React from "react";

const AccountsTab = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <Input
          clearable
          label="Email"
          placeholder="mail@mail.com"
          type="text"
        />
        <Input clearable label="Twitter" placeholder="@twitter" type="text" />
        <Input clearable label="Linkedin" placeholder="/linkedin" type="text" />
      </div>
    </div>
  );
};

export default AccountsTab;
