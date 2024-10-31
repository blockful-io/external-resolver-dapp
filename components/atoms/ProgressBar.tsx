import { RegistrationStep } from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";

export const ProgressBar = () => {
  const { nameRegistrationData } = useNameRegistration();

  const currentStep = nameRegistrationData.currentRegistrationStep;
  const stepIndex = steps.indexOf(currentStep) + 1;
  const progressPercentage = (stepIndex / (steps.length - 1)) * 100;

  return (
    <div className="relative h-1 w-full bg-gray-200">
      <div
        className="absolute h-full w-1/2 bg-blue-500 transition-all duration-200"
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  );
};

const steps = Object.values(RegistrationStep);
