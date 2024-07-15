import { isAddress } from "viem";
import { DEFAULT_CHAIN_ID, SupportedNetwork } from "../wallet/chains";

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
}

export const ENSResolverToNetwork = {
  [EnsResolver.Mainnet]: SupportedNetwork.MAINNET,
  [EnsResolver.Database]: SupportedNetwork.TESTNET,
  [EnsResolver.Arbitrum]: SupportedNetwork.TESTNET,
  [EnsResolver.Optimism]: SupportedNetwork.TESTNET,
};

export const ENS_REGISTRATIONS_SECRET_KEY = "nameRegistrationSecret";
export const OPEN_REGISTRATIONS_LOCAL_STORAGE_KEY = "openENSNameRegistrations";

export const nameRegistrationSCs: Record<
  number,
  Record<string, `0x${string}`>
> = {
  [SupportedNetwork.MAINNET]: {
    ENS_PUBLIC_RESOLVER: "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63",
    ETH_REGISTRAR: "0x253553366Da8546fC250F225fe3d25d0C782303b",
  },
  [SupportedNetwork.TESTNET]: {
    ENS_PUBLIC_RESOLVER: "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD",
    ETH_REGISTRAR: "0xFED6a969AaA60E4961FCD3EBF1A2e8913ac65B72",
    UNIVERSAL_RESOLVER: "0xc8af999e38273d658be1b921b88a9ddf005769cc",
  },
};

const DEFAULT_DATABASE_RESOLVER_ADDRESS =
  "0x66E8aEEfc472B378A03C6F7e3a3A06254D98f402";

const databaseResolverAddress =
  process.env.NEXT_PUBLIC_DATABASE_RESOLVER_ADDRESS &&
  isAddress(process.env.NEXT_PUBLIC_DATABASE_RESOLVER_ADDRESS)
    ? process.env.NEXT_PUBLIC_DATABASE_RESOLVER_ADDRESS
    : DEFAULT_DATABASE_RESOLVER_ADDRESS;

export const ensResolverAddress: Record<EnsResolver, `0x${string}`> = {
  [EnsResolver.Database]: databaseResolverAddress,
  [EnsResolver.Arbitrum]: "0xfE47e2f223e4D098B84E79AF5fC5faA33bf6Da4D",
  [EnsResolver.Optimism]: "0x55b00cD5e9Bd2Bb5eB001969E0BE7ac17b505c2f",
  [EnsResolver.Mainnet]: "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63",
};

export const nameRegistrationContracts = nameRegistrationSCs[DEFAULT_CHAIN_ID];

export const DEFAULT_REGISTRATION_DOMAIN_CONTROLLED_FUSES = 0;
export const DEFAULT_REGISTRATION_YEARS = 1n;

export const ETHEREUM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const MULTICALL_3_CONTRACT_ADDRESS =
  "0xcA11bde05977b3631167028862bE2a173976CA11";
