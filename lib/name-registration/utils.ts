import { Address } from "viem";
import {
  EnsResolver,
  ensResolverAddress,
  RegistrationBlock,
  RegistrationStep,
} from "./constants";

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
      return RegistrationBlock.RequestToRegister;

    case RegistrationStep.SetTextRecords:
    case RegistrationStep.SetTextRecordsBasicInfo:
    case RegistrationStep.SetTextRecordsAddresses:
    case RegistrationStep.SetTextRecordsSocialAccounts:
      return RegistrationBlock.CustomizeProfile;

    case RegistrationStep.WaitingRegistrationLocktime:
    case RegistrationStep.NameSecuredToBeRegistered:
      return RegistrationBlock.RegisterDomain;

    case RegistrationStep.NameRegisteredAwaitingRecordsSetting:
    case RegistrationStep.RecordsSetAwaitingPrimaryNameSetting:
      return RegistrationBlock.RegisterProfile;

    case RegistrationStep.Registered:
      return RegistrationBlock.Registered;

    default:
      throw new Error("Invalid registration step");
  }
};
