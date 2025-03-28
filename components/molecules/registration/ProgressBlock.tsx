import { ProgressBlockTabComponent } from "@/components/atoms";
import {
  ProgressBlockTabStep,
  RegistrationBlock,
} from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { getRegistrationStepBlock } from "@/lib/name-registration/utils";

export const ProgressBlock = () => {
  const { nameRegistrationData } = useNameRegistration();

  return (
    <div className="neon-effect flex h-20 w-full items-center justify-between border-b border-gray-200 bg-white px-[60px] py-4">
      <div className="mx-auto flex w-full items-center justify-between">
        {progressBlockTabSteps.map((progressBlockTabStep, index) => {
          return (
            <ProgressBlockTabComponent
              title={progressBlockTabStep.title}
              subtitle={progressBlockTabStep.subtitle}
              stepNumber={index + 1}
              registrationBlock={progressBlockTabStep.registrationBlock}
              key={progressBlockTabStep.title}
              currentRegistrationBlock={getRegistrationStepBlock(
                nameRegistrationData.currentRegistrationStep,
              )}
            />
          );
        })}
      </div>
    </div>
  );
};

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
    title: "Customize Profile",
    subtitle: "Customize your profile",
    registrationBlock: RegistrationBlock.CustomizeProfile,
  },
  {
    title: "Register Domain",
    subtitle: "Register your new Domain",
    registrationBlock: RegistrationBlock.RegisterDomain,
  },
  {
    title: "Register Profile",
    subtitle: "Save your texts records",
    registrationBlock: RegistrationBlock.RegisterProfile,
  },
];
