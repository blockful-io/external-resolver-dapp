"use client";

import ProgressBlock from "@/components/02-molecules/ProgressBlock";
import RegistrationBody from "@/components/02-molecules/RegistrationBody";
import { RegistrationStep } from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";

export default function RegisterNamePage() {
  const { nameRegistrationData, setCurrentRegistrationStep } =
    useNameRegistration();

  return (
    <div className="text-black flex h-full flex-col items-center justify-start bg-white">
      <div className="w-full h-1 neon-effect bg-blue-500" />
      <ProgressBlock />
      <div className="z-10 mx-auto text-center py-10  px-[60px] h-full">
        <h1 className="mb-5 text-xl font-semibold">Register Name Page</h1>
        <RegistrationBody />
        <p className="mb-10">
          currentRegistrationStep:{" "}
          {nameRegistrationData.currentRegistrationStep}
        </p>
        <button
          className="m-3 p-3 bg-white border border-gray-300 rounded-md text-black"
          onClick={() =>
            setCurrentRegistrationStep(RegistrationStep.ENSResolver)
          }
        >
          Set ENS Resolver
        </button>
        <button
          className="m-3 p-3 bg-white border border-gray-300 rounded-md text-black"
          onClick={() =>
            setCurrentRegistrationStep(RegistrationStep.PrimaryName)
          }
        >
          Set as Primary Name
        </button>
        <button
          className="m-3 p-3 bg-white border border-gray-300 rounded-md text-black"
          onClick={() =>
            setCurrentRegistrationStep(RegistrationStep.RequestToRegister)
          }
        >
          Set Request to register
        </button>
        <button
          className="m-3 p-3 bg-white border border-gray-300 rounded-md text-black"
          onClick={() => setCurrentRegistrationStep(RegistrationStep.Register)}
        >
          Set to register
        </button>
      </div>
    </div>
  );
}
