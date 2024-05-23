"use client";

import { Input } from "@ensdomains/thorin";
import React from "react";

const AddressesTab = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <Input
          clearable
          label="ETH"
          placeholder="0x000ee9A6Bcec9AadCc883bD52B2c9A75FB098991"
          type="text"
        />
      </div>
    </div>
  );
};

export default AddressesTab;
