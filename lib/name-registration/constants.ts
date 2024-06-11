import { DEFAULT_CHAIN_ID, SupportedNetwork } from "../wallet/chains";

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

export enum EnsResolver {
  Mainnet = "Mainnet",
  Database = "Database",
  Arbitrum = "Arbitrum",
  Optimism = "Optimism",
}

export const ENS_REGISTRATIONS_SECRET_KEY = "nameRegistrationSecret";

export const nameRegistrationSCs: Record<
  number,
  Record<string, `0x${string}`>
> = {
  [SupportedNetwork.MAINNET]: {
    ENS_PUBLIC_RESOLVER: "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63",
    ETH_REGISTRAR: "0x253553366Da8546fC250F225fe3d25d0C782303b",
  },
  [SupportedNetwork.TESTNET]: {
    ENS_PUBLIC_RESOLVER: "0xd7a4F6473f32aC2Af804B3686AE8F1932bC35750",
    ETH_REGISTRAR: "0xFED6a969AaA60E4961FCD3EBF1A2e8913ac65B72",
  },
};

export const ensResolverAddress: Record<EnsResolver, string> = {
  [EnsResolver.Arbitrum]: "0xfE47e2f223e4D098B84E79AF5fC5faA33bf6Da4D",
  [EnsResolver.Database]: "0x7b7aee0eD5929021F81D5d74d36eD6a640Ed9550",
  [EnsResolver.Optimism]: "0x55b00cD5e9Bd2Bb5eB001969E0BE7ac17b505c2f",
  [EnsResolver.Mainnet]: "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63",
};

export const nameRegistrationContracts = nameRegistrationSCs[DEFAULT_CHAIN_ID];

export const DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES = 0;
export const DEFAULT_REGISTRATION_YEARS = 1n;
