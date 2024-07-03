import { RegistrationBlock, RegistrationStep } from "./constants";

/* NAME REGISTRATION UI RELATED LOGIC ⬇️ */

export const getRegistrationStepBlock = (
  step: RegistrationStep
): RegistrationBlock => {
  switch (step) {
    case RegistrationStep.RegistrationYears:
    case RegistrationStep.PrimaryName:
    case RegistrationStep.ENSResolver:
      return RegistrationBlock.DomainSettings;

    case RegistrationStep.RequestToRegister:
    case RegistrationStep.SetTextRecords:
    case RegistrationStep.SetTextRecordsBasicInfo:
    case RegistrationStep.SetTextRecordsAddresses:
    case RegistrationStep.SetTextRecordsSocialAccounts:
    case RegistrationStep.WaitingRegistrationLocktime:
    case RegistrationStep.NameSecuredToBeRegistered:
    case RegistrationStep.NameRegisteredAwaitingRecordsSetting:
      return RegistrationBlock.RequestToRegister;

    case RegistrationStep.Register:
      return RegistrationBlock.RegisterDomain;

    case RegistrationStep.Registered:
      return RegistrationBlock.Registered;

    default:
      throw new Error("Invalid registration step");
  }
};
