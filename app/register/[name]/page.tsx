"use client";

import ProgressBlock from "@/components/02-molecules/ProgressBlock";
import RegistrationBody from "@/components/02-molecules/RegistrationBody";
import RegistrationSummary from "@/components/02-molecules/RegistrationSummary";

import { RegistrationStep } from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";

export default function RegisterNamePage() {
  const { nameRegistrationData, setCurrentRegistrationStep } =
    useNameRegistration();

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
