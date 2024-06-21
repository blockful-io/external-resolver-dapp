import { RegistrationStep } from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import { RegistrationYearsComponent } from "./RegistrationYearsComponent";
import { PrimaryNameComponent } from "./PrimaryNameComponent";
import { ENSResolverComponent } from "./ENSResolverComponent";
import { RequestToRegisterComponent } from "./RequestToRegisterComponent";
import { WaitingRegistrationLocktimeComponent } from "./WaitingRegistrationLocktimeComponent";
import { NameSecuredToBeRegisteredComponent } from "./NameSecuredToBeRegisteredComponent";
import { RegisterComponent } from "./RegisterComponent";
import { RegisteredComponent } from "./RegisteredComponent";
import { SetTextRecordsComponent } from "./SetTextRecordsComponent";
import { SetTextRecordsBasicInfoComponent } from "./SetTextRecordsBasicInfoComponent";
import { SetTextRecordsSocialAccountsComponent } from "./SetTextRecordsSocialAccountsComponent";
import { SetTextRecordsAddressesComponent } from "./SetTextRecordsAddressesComponent";

export const RegistrationBody = () => {
  const { nameRegistrationData, setCurrentRegistrationStep } =
    useNameRegistration();

  const currentStep = nameRegistrationData.currentRegistrationStep;

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

  const CurrentComponent = stepComponentMap()[currentStep];

  return (
    <CurrentComponent
      handleNextStep={handleNextStep}
      handlePreviousStep={handlePreviousStep}
    />
  );
};

export const stepComponentMap = (): Record<RegistrationStep, React.FC<any>> => {
  return {
    [RegistrationStep.RegistrationYears]: RegistrationYearsComponent,
    [RegistrationStep.PrimaryName]: PrimaryNameComponent,
    [RegistrationStep.ENSResolver]: ENSResolverComponent,
    [RegistrationStep.RequestToRegister]: RequestToRegisterComponent,
    [RegistrationStep.SetTextRecords]: SetTextRecordsComponent,
    [RegistrationStep.SetTextRecordsBasicInfo]:
      SetTextRecordsBasicInfoComponent,
    [RegistrationStep.SetTextRecordsSocialAccounts]:
      SetTextRecordsSocialAccountsComponent,
    [RegistrationStep.SetTextRecordsAddresses]:
      SetTextRecordsAddressesComponent,
    [RegistrationStep.WaitingRegistrationLocktime]:
      WaitingRegistrationLocktimeComponent,
    [RegistrationStep.NameSecuredToBeRegistered]:
      NameSecuredToBeRegisteredComponent,
    [RegistrationStep.Register]: RegisterComponent,
    [RegistrationStep.Registered]: RegisteredComponent,
  };
};
