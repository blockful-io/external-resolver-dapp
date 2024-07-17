import { ProgressBlockTabComponent } from "@/components/01-atoms";
import {
  ProgressBlockTabStep,
  RegistrationBlock,
} from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { getRegistrationStepBlock } from "@/lib/name-registration/utils";

export const ProgressBlock = () => {
  const { nameRegistrationData } = useNameRegistration();

  return (
    <div className="w-full h-20 bg-white neon-effect px-[60px] py-4 flex justify-between items-center border-b border-gray-200">
      <div className="flex justify-between items-center w-full mx-auto">
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
