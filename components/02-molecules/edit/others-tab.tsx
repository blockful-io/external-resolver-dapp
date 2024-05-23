"use client";

import { Input } from "@ensdomains/thorin";
import React from "react";

const OthersTab = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <Input clearable label="Content hash" type="text" />
        <Input clearable label="ABI" type="text" />
      </div>
    </div>
  );
};

export default OthersTab;
