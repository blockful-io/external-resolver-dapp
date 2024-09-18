import { isAddress } from "viem";
import { SupportedNetwork } from "../wallet/chains";

export enum RegistrationStep {
  RegistrationYears = "RegistrationYears",
  PrimaryName = "PrimaryName",
  ENSResolver = "ENSResolver",
  RequestToRegister = "RequestToRegister",
  SetTextRecords = "SetTextRecords",
  SetTextRecordsBasicInfo = "SetTextRecordsBasicInfo",
  SetTextRecordsSocialAccounts = "SetTextRecordsSocialAccounts",
  SetTextRecordsAddresses = "SetTextRecordsAddresses",
  WaitingRegistrationLocktime = "WaitingRegistrationLocktime",
  NameSecuredToBeRegistered = "NameSecuredToBeRegistered",
  NameRegisteredAwaitingRecordsSetting = "NameRegisteredAwaitingRecordsSetting",
  RecordsSetAwaitingPrimaryNameSetting = "RecordsSetAwaitingPrimaryNameSetting",
  Registered = "Registered",
}

export enum RegistrationBlock {
  DomainSettings = "DomainSettings",
  RequestToRegister = "RequestToRegister",
  CustomizeProfile = "CustomizeProfile",
  RegisterDomain = "RegisterDomain",
  RegisterProfile = "RegisterProfile",
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
  Custom = "Custom",
}

export const ENSResolverToNetwork = {
  // [EnsResolver.Mainnet]: SupportedNetwork.MAINNET,
  [EnsResolver.Database]: SupportedNetwork.TESTNET,
  [EnsResolver.Arbitrum]: SupportedNetwork.TESTNET,
  [EnsResolver.Optimism]: SupportedNetwork.TESTNET,
};

export const ENS_REGISTRATIONS_SECRET_KEY = "nameRegistrationSecret";
export const OPEN_REGISTRATIONS_LOCAL_STORAGE_KEY = "openENSNameRegistrations";

export const nameRegistrationSmartContracts: Record<
  SupportedNetwork,
  Record<string, `0x${string}`>
> = {
  [SupportedNetwork.MAINNET]: {
    // Todo: update contracts based on Mainnet deployments once Mainnet support is added
    ENS_PUBLIC_RESOLVER: "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63",
    ETH_REGISTRAR: "0x253553366Da8546fC250F225fe3d25d0C782303b",
  },
  [SupportedNetwork.TESTNET]: {
    ENS_PUBLIC_RESOLVER: "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD",
    ETH_REGISTRAR: "0xFED6a969AaA60E4961FCD3EBF1A2e8913ac65B72",
    UNIVERSAL_RESOLVER: "0xc8af999e38273d658be1b921b88a9ddf005769cc",
    ENS_REVERSE_REGISTRAR: "0xA0a1AbcDAe1a2a4A2EF8e9113Ff0e02DD81DC0C6",
  },
};

const sepoliaDatabaseResolverAddress =
  process.env.NEXT_PUBLIC_DATABASE_RESOLVER_ADDRESS_SEPOLIA;

const mainnetDatabaseResolverAddress =
  process.env.NEXT_PUBLIC_DATABASE_RESOLVER_ADDRESS_SEPOLIA;

if (
  !sepoliaDatabaseResolverAddress ||
  !mainnetDatabaseResolverAddress ||
  !isAddress(sepoliaDatabaseResolverAddress) ||
  !isAddress(mainnetDatabaseResolverAddress)
) {
  throw new Error(
    "NEXT_PUBLIC_DATABASE_RESOLVER_ADDRESS_SEPOLIA and NEXT_PUBLIC_DATABASE_RESOLVER_ADDRESS_MAINNET must be set and valid addresses"
  );
}

export const ensResolverAddress: Record<EnsResolver, `0x${string}`> = {
  [EnsResolver.Database]: sepoliaDatabaseResolverAddress,
  [EnsResolver.Custom]: sepoliaDatabaseResolverAddress,
  [EnsResolver.Arbitrum]: "0xfE47e2f223e4D098B84E79AF5fC5faA33bf6Da4D",
  [EnsResolver.Optimism]: "0x55b00cD5e9Bd2Bb5eB001969E0BE7ac17b505c2f",
  [EnsResolver.Mainnet]: mainnetDatabaseResolverAddress,
};

export const DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES = 0;
export const DEFAULT_REGISTRATION_YEARS = 1n;

export const ETHEREUM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const MULTICALL_3_CONTRACT_ADDRESS =
  "0xcA11bde05977b3631167028862bE2a173976CA11";

export const ENS_NAME_REGISTRATION_COMMITMENT_LOCKUP_TIME = 60000;
