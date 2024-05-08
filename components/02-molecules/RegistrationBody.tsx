"use client";

import { RegistrationStep } from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import RegistrationYearsComponent from "./registration/RegistrationYearsComponent";
import PrimaryNameComponent from "./registration/PrimaryNameComponent";
import ENSResolverComponent from "./registration/ENSResolverComponent";
import RequestToRegisterComponent from "./registration/RequestToRegisterComponent";
import WaitingRegistrationLocktimeComponent from "./registration/WaitingRegistrationLocktimeComponent";
import NameSecuredToBeRegisteredComponent from "./registration/NameSecuredToBeRegisteredComponent";
import RegisterComponent from "./registration/RegisterComponent";
import RegisteredComponent from "./registration/RegisteredComponent";

export default function RegistrationBody() {
  const { nameRegistrationData, setCurrentRegistrationStep } =
    useNameRegistration();

  const currentStep = nameRegistrationData.currentRegistrationStep;

  const CurrentComponent = stepComponentMap[currentStep];

  const handleNextStep = () => {
    const stepKeys = Object.keys(RegistrationStep) as Array<
      keyof typeof RegistrationStep
    >;
    const currentIndex = stepKeys.indexOf(currentStep as any);
    const nextStep = stepKeys[currentIndex + 1] || stepKeys[0];
    setCurrentRegistrationStep(RegistrationStep[nextStep]);
  };

  const handlePreviousStep = () => {
    const stepKeys = Object.keys(RegistrationStep) as Array<
      keyof typeof RegistrationStep
    >;
    const currentIndex = stepKeys.indexOf(currentStep as any);
    const previousStep =
      currentIndex > 0
        ? stepKeys[currentIndex - 1]
        : stepKeys[stepKeys.length - 1];
    setCurrentRegistrationStep(RegistrationStep[previousStep]);
  };

  return (
    <div>
      <CurrentComponent
        handleNextStep={handleNextStep}
        handlePreviousStep={handlePreviousStep}
      />
      <div className="flex gap-4 items-center justify-center mt-4">
        <button onClick={handlePreviousStep} className="p-4 bg-blue-50">
          Previous Step
        </button>
        <button onClick={handleNextStep} className="p-4 bg-blue-50">
          Next Step
        </button>
      </div>
    </div>
  );
}

export const stepComponentMap: Record<RegistrationStep, React.FC<any>> = {
  [RegistrationStep.RegistrationYears]: RegistrationYearsComponent,
  [RegistrationStep.PrimaryName]: PrimaryNameComponent,
  [RegistrationStep.ENSResolver]: ENSResolverComponent,
  [RegistrationStep.RequestToRegister]: RequestToRegisterComponent,
  [RegistrationStep.WaitingRegistrationLocktime]:
    WaitingRegistrationLocktimeComponent,
  [RegistrationStep.NameSecuredToBeRegistered]:
    NameSecuredToBeRegisteredComponent,
  [RegistrationStep.Register]: RegisterComponent,
  [RegistrationStep.Registered]: RegisteredComponent,
};
