"use client";

import {
  ProgressBlockTabStep,
  RegistrationBlock,
} from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { getRegistrationStepBlock } from "@/lib/name-registration/utils";
import ProgressBlockTabComponent from "../../01-atoms/ProgressBlockTab";

export default function ProgressBlock() {
  const { nameRegistrationData } = useNameRegistration();

  return (
    <div className="w-full h-20 bg-white neon-effect px-[60px] py-4 flex justify-between items-center border-b border-gray-200">
      {progressBlockTabSteps.map((progressBlockTabStep, index) => {
        return (
          <ProgressBlockTabComponent
            title={progressBlockTabStep.title}
            subtitle={progressBlockTabStep.subtitle}
            stepNumber={index + 1}
            registrationBlock={progressBlockTabStep.registrationBlock}
            key={progressBlockTabStep.title}
            currentRegistrationBlock={getRegistrationStepBlock(
              nameRegistrationData.currentRegistrationStep
            )}
          />
        );
      })}
    </div>
  );
}

const progressBlockTabSteps: ProgressBlockTabStep[] = [
  {
    title: "Domain settings",
    subtitle: "Customize name preferences",
    registrationBlock: RegistrationBlock.DomainSettings,
  },
  {
    title: "Request to register",
    subtitle: "Commit to avoid front-running",
    registrationBlock: RegistrationBlock.RequestToRegister,
  },
  {
    title: "Register domain",
    subtitle: "Registration transcation",
    registrationBlock: RegistrationBlock.RegisterDomain,
  },
];
