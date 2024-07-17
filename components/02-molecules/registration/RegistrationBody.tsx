import { RegistrationStep } from "@/lib/name-registration/constants";
import { useNameRegistration } from "@/lib/name-registration/useNameRegistration";
import {
  RegistrationYearsComponent,
  PrimaryNameComponent,
  ENSResolverComponent,
  RequestToRegisterComponent,
  WaitingRegistrationLocktimeComponent,
  NameSecuredToBeRegisteredComponent,
  SetTextRecordsComponent,
  RegisteredComponent,
  SetTextRecordsBasicInfoComponent,
  SetTextRecordsSocialAccountsComponent,
  SetTextRecordsAddressesComponent,
  NameRegisteredAwaitingRecordsSettingComponent,
  RecordsSetAwaitingPrimaryNameSetting,
} from "./";
import { useEffect } from "react";
import {
  getOpenNameRegistrationsOfNameByWallet,
  setNameRegistrationSecret,
} from "@/lib/name-registration/localStorage";
import { useAccount } from "wagmi";

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

  const { address } = useAccount();

  useEffect(() => {
    if (address && nameRegistrationData.name) {
      const openRegistration = getOpenNameRegistrationsOfNameByWallet(
        address,
        nameRegistrationData.name
      );

      const hasOpenRegistrationForSearchedName = !!openRegistration;
      const hasDoneCommitmentForSearchedName =
        openRegistration?.commitTxReceipt;
      const secretFromPastNameRegistrationCommitment = openRegistration?.secret;

      if (
        hasOpenRegistrationForSearchedName &&
        hasDoneCommitmentForSearchedName &&
        secretFromPastNameRegistrationCommitment
      ) {
        setNameRegistrationSecret(secretFromPastNameRegistrationCommitment);
        setCurrentRegistrationStep(RegistrationStep.SetTextRecords);
      }
    }
  }, []);

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
    [RegistrationStep.Registered]: RegisteredComponent,
    [RegistrationStep.NameRegisteredAwaitingRecordsSetting]:
      NameRegisteredAwaitingRecordsSettingComponent,
    [RegistrationStep.RecordsSetAwaitingPrimaryNameSetting]:
      RecordsSetAwaitingPrimaryNameSetting,
  };
};
