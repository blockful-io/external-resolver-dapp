"use client";

import { RegistrationStep } from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";

export default function RegisterNamePage() {
  const { nameRegistrationData, setCurrentRegistrationStep } =
    useNameRegistration();

  return (
    <div className="min-h-screen">
      <div className="pt-20 mx-auto text-center">
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
