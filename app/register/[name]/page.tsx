"use client";

import ProgressBlock from "@/components/02-molecules/registration/ProgressBlock";
import RegistrationBody from "@/components/02-molecules/registration/RegistrationBody";
import RegistrationSummary from "@/components/02-molecules/registration/RegistrationSummary";

import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";

export default function RegisterNamePage() {
  return (
    <div className="text-black flex h-full flex-col items-center justify-start bg-white">
      <div className="w-full h-1 neon-effect bg-blue-500" />
      <ProgressBlock />
      <div className="flex justify-between z-10 mx-auto text-center py-10 h-full w-full max-w-[1216px]">
        <RegistrationBody />
        <div>
          <RegistrationSummary />
        </div>
      </div>
    </div>
  );
}
