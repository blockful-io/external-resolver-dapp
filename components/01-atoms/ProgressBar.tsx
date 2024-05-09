import { RegistrationStep } from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";

export const ProgressBar = () => {
  const { nameRegistrationData } = useNameRegistration();

  const currentStep = nameRegistrationData.currentRegistrationStep;
  const barNumber = steps.indexOf(currentStep) + 1;
  const progressPercentage = (barNumber / (steps.length - 1)) * 100;

  return (
    <div className="w-full relative h-1 bg-gray-200">
      <div
        className={`absolute w-1/2 h-full bg-blue-500 transition-all duration-200 neon-effect`}
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  );
};

const steps = [
  RegistrationStep.RegistrationYears,
  RegistrationStep.PrimaryName,
  RegistrationStep.ENSResolver,
  RegistrationStep.RequestToRegister,
  RegistrationStep.WaitingRegistrationLocktime,
  RegistrationStep.NameSecuredToBeRegistered,
  RegistrationStep.Register,
  RegistrationStep.Registered,
];