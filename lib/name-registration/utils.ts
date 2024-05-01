import { RegistrationBlock, RegistrationStep } from "./constants";

export const getRegistrationStepBlock = (
  step: RegistrationStep
): RegistrationBlock => {
  switch (step) {
    case RegistrationStep.RegistrationYears:
    case RegistrationStep.PrimaryName:
    case RegistrationStep.ENSResolver:
      return RegistrationBlock.DomainSettings;

    case RegistrationStep.RequestToRegister:
    case RegistrationStep.WaitingRegistrationLocktime:
    case RegistrationStep.NameSecuredToBeRegistered:
      return RegistrationBlock.RequestToRegister;

    case RegistrationStep.Register:
      return RegistrationBlock.RegisterDomain;

    case RegistrationStep.Registered:
      return RegistrationBlock.Registered;

    default:
      throw new Error("Invalid registration step");
  }
};
