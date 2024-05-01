"use client";

import { HomepageBg } from "@/components/01-atoms/HomepageBg";
import { RegistrationStep } from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";

export default function RegisterNamePage() {
  const { nameRegistrationData, setCurrentRegistrationStep } =
    useNameRegistration();

  return (
    <div className="text-black flex relative h-screen flex-col items-center justify-center bg-white p-4 overflow-clip">
      <HomepageBg />
      <div className="z-10 pt-20 mx-auto text-center">
        <h1 className="mb-5 text-xl font-semibold">Register Name Page</h1>
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
      </div>
    </div>
  );
}
