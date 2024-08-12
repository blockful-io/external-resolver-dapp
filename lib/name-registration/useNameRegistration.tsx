import { useAppDispatch, useAppSelector } from "../globalStore";
import { nameRegistrationInitialState } from "./reducers";
import {
  updateCommitSubmitTimestamp,
  updateCommitTxReceipt,
  updateCurrentRegistrationStep,
  updateCustomResolverAddress,
  updateDomainAddresses,
  updateEnsResolver,
  updateEstimatedNetworkFee,
  updateIsPrimaryName,
  updateNamePrice,
  updateNameToRegister,
  updateRegisterTxReceipt,
  updateRegistrationPrice,
  updateRegistrationYears,
  updateTextRecords,
} from "./actions";
import { EnsResolver, ensResolverAddress, RegistrationStep } from "./constants";
import { ENSName } from "@namehash/ens-utils";
import { Address, TransactionReceipt } from "viem";
import {
  endNameRegistrationPreviouslyOpen,
  getNameRegistrationSecret,
  setNameRegistrationInLocalStorage,
} from "./localStorage";
import { useAccount } from "wagmi";

interface NameRegistrationData {
  nameRegistrationData: {
    textRecords: Record<string, string>;
    domainAddresses: Record<string, string>;
    commitSubmitTimestamp: Date | null;
    registerTxReceipt: TransactionReceipt | null;
    commitTxReceipt: TransactionReceipt | null;
    currentRegistrationStep: RegistrationStep;
    customResolverAddress: Address | null;
    estimatedNetworkFee: bigint | null;
    registrationPrice: bigint | null;
    registrationYears: number;
    namePrice: bigint | null;
    ensResolver: EnsResolver;
    asPrimaryName: boolean;
    name: ENSName | null;
  };
  setNamePrice: (namePrice: bigint) => void;
  setEstimatedNetworkFee: (estimatedNetworkFee: bigint) => void;
  setRegistrationPrice: (registrationPrice: bigint) => void;
  setCurrentRegistrationStep: (
    currentRegistrationStep: RegistrationStep
  ) => void;
  setCommitSubmitTimestamp: (timestamp: Date) => void;
  setRegisterTxReceipt: (txReceipt: TransactionReceipt) => void;
  setCommitTxReceipt: (txReceipt: TransactionReceipt) => void;
  setRegistrationYears: (registrationYears: number) => void;
  setNameToRegister: (nameToRegister: ENSName) => void;
  setAsPrimaryName: (asPrimaryName: boolean) => void;
  setCustomResolverAddress: (customResolverAddress: Address) => void;
  setEnsResolver: (ensResolver: EnsResolver) => void;
  setTextRecords: (textRecords: Record<string, string>) => void;
  setDomainAddresses: (domainAddresses: Record<string, string>) => void;
  getResolverAddress: () => Address;
}

export const useNameRegistration = (): NameRegistrationData => {
  const { address } = useAccount();

  const currentRegistrationStep = useAppSelector(
    (state) => state.currentRegistrationStep
  );
  const estimatedNetworkFee = useAppSelector(
    (state) => state.estimatedNetworkFee
  );
  const registrationYears = useAppSelector((state) => state.registrationYears);
  const registrationPrice = useAppSelector((state) => state.registrationPrice);
  const commitSubmitTimestamp = useAppSelector(
    (state) => state.commitSubmitTimestamp
  );
  const registerTxReceipt = useAppSelector((state) => state.registerTxReceipt);
  const commitTxReceipt = useAppSelector((state) => state.commitTxReceipt);
  const asPrimaryName = useAppSelector((state) => state.asPrimaryName);

  const customResolverAddress = useAppSelector(
    (state) => state.customResolverAddress
  );
  const ensResolver = useAppSelector((state) => state.ensResolver);
  const namePrice = useAppSelector((state) => state.namePrice);
  const name = useAppSelector((state) => state.name);
  const textRecords = useAppSelector((state) => state.textRecords);
  const domainAddresses = useAppSelector((state) => state.domainAddresses);

  const dispatch = useAppDispatch();

  const setCurrentRegistrationStep = (
    currentRegistrationStep: RegistrationStep
  ) => {
    dispatch(updateCurrentRegistrationStep(currentRegistrationStep));
  };

  const setRegistrationYears = (registrationYears: number) => {
    dispatch(updateRegistrationYears(registrationYears));
  };

  const setAsPrimaryName = (asPrimaryName: boolean) => {
    dispatch(updateIsPrimaryName(asPrimaryName));
  };

  const setEnsResolver = (ensResolver: EnsResolver) => {
    dispatch(updateEnsResolver(ensResolver));
  };

  const setNameToRegister = (nameToRegister: ENSName) => {
    dispatch(updateNameToRegister(nameToRegister));
  };

  const setCommitTxReceipt = (txReceipt: TransactionReceipt) => {
    if (address) {
      setNameRegistrationInLocalStorage(address, name, {
        commitTxReceipt: txReceipt,
        secret: getNameRegistrationSecret(),
      });
    }

    dispatch(updateCommitTxReceipt(txReceipt));
  };

  const setCommitSubmitTimestamp = (timestamp: Date) => {
    dispatch(updateCommitSubmitTimestamp(timestamp));
  };

  const setRegisterTxReceipt = (txReceipt: TransactionReceipt) => {
    if (txReceipt.status === "success" && address) {
      endNameRegistrationPreviouslyOpen(address, name);
    }

    dispatch(updateRegisterTxReceipt(txReceipt));
  };

  const setNamePrice = (namePrice: bigint) => {
    dispatch(updateNamePrice(namePrice));
  };

  const setEstimatedNetworkFee = (estimatedNetworkFee: bigint) => {
    dispatch(updateEstimatedNetworkFee(estimatedNetworkFee));
  };

  const setRegistrationPrice = (registrationPrice: bigint) => {
    dispatch(updateRegistrationPrice(registrationPrice));
  };

  const setCustomResolverAddress = (customResolverAddress: Address) => {
    dispatch(updateCustomResolverAddress(customResolverAddress));
  };

  const setTextRecords = (textRecords: Record<string, string>) => {
    dispatch(updateTextRecords(textRecords));
  };

  const setDomainAddresses = (domainAddresses: Record<string, string>) => {
    dispatch(updateDomainAddresses(domainAddresses));
  };

  const getResolverAddress = (): Address => {
    return ensResolver === EnsResolver.Custom && customResolverAddress
      ? customResolverAddress
      : ensResolverAddress[ensResolver as EnsResolver];
  };

  return {
    nameRegistrationData:
      {
        commitSubmitTimestamp,
        currentRegistrationStep,
        estimatedNetworkFee,
        customResolverAddress,
        registrationYears,
        registrationPrice,
        registerTxReceipt,
        textRecords,
        domainAddresses,
        commitTxReceipt,
        asPrimaryName,
        ensResolver,
        namePrice,
        name,
      } || nameRegistrationInitialState,
    setCurrentRegistrationStep,
    setCommitSubmitTimestamp,
    setEstimatedNetworkFee,
    setRegistrationYears,
    setRegistrationPrice,
    setCustomResolverAddress,
    setRegisterTxReceipt,
    setCommitTxReceipt,
    setNameToRegister,
    setAsPrimaryName,
    setTextRecords,
    setDomainAddresses,
    setEnsResolver,
    setNamePrice,
    getResolverAddress,
  };
};
