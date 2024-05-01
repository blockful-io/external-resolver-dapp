export enum RegistrationStep {
  RegistrationYears = "RegistrationYears",
  PrimaryName = "PrimaryName",
  ENSResolver = "ENSResolver",
  RequestToRegister = "RequestToRegister",
  WaitingRegistrationLocktime = "WaitingRegistrationLocktime",
  NameSecuredToBeRegistered = "NameSecuredToBeRegistered",
  Register = "Register",
  Registered = "Registered",
}

export enum RegistrationBlock {
  DomainSettings = "DomainSettings",
  RequestToRegister = "RequestToRegister",
  RegisterDomain = "RegisterDomain",
  Registered = "Registered",
}

export interface ProgressBlockTabStep {
  title: string;
  subtitle: string;
  registrationBlock: RegistrationBlock;
}
