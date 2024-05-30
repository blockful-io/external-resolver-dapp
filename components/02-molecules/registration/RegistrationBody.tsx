"use client";

import { RegistrationStep } from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { RegistrationYearsComponent } from "./";
import { PrimaryNameComponent } from "./PrimaryNameComponent";
import { ENSResolverComponent } from "./ENSResolverComponent";
import { RequestToRegisterComponent } from "./RequestToRegisterComponent";
import { WaitingRegistrationLocktimeComponent } from "./WaitingRegistrationLocktimeComponent";
import { NameSecuredToBeRegisteredComponent } from "./NameSecuredToBeRegisteredComponent";
import { RegisterComponent } from "./RegisterComponent";
import { RegisteredComponent } from "./RegisteredComponent";

export default function RegistrationBody() {
  const { nameRegistrationData, setCurrentRegistrationStep } =
    useNameRegistration();

  const currentStep = nameRegistrationData.currentRegistrationStep;

  const CurrentComponent = stepComponentMap[currentStep];

  const handleNextStep = () => {
    const stepKeys = Object.keys(RegistrationStep) as Array<
      keyof typeof RegistrationStep
    >;
    const currentIndex = stepKeys.indexOf(currentStep);
    const nextStep = stepKeys[currentIndex + 1] || stepKeys[0];
    setCurrentRegistrationStep(RegistrationStep[nextStep]);
  };

  const handlePreviousStep = () => {
    const stepKeys = Object.keys(RegistrationStep) as Array<
      keyof typeof RegistrationStep
    >;
    const currentIndex = stepKeys.indexOf(currentStep);
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
