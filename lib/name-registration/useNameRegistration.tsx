import { useAppDispatch, useAppSelector } from "../globalStore";
import { nameRegistrationInitialState } from "./reducers";
import {
  updateCommitSubmitTimestamp,
  updateCommitTxReceipt,
  updateCurrentRegistrationStep,
  updateEnsResolver,
  updateEstimatedNetworkFee,
  updateIsPrimaryName,
  updateNamePrice,
  updateNameToRegister,
  updateRegisterTxReceipt,
  updateRegistrationPrice,
  updateRegistrationYears,
} from "./actions";
import { EnsResolver, RegistrationStep } from "./constants";
import { ENSName } from "@namehash/ens-utils";
import { TransactionReceipt } from "viem";

interface NameRegistrationData {
  nameRegistrationData: {
    commitSubmitTimestamp: Date | null;
    registerTxReceipt: TransactionReceipt | null;
    commitTxReceipt: TransactionReceipt | null;
    currentRegistrationStep: RegistrationStep;
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
  setEnsResolver: (ensResolver: EnsResolver) => void;
}

export const useNameRegistration = (): NameRegistrationData => {
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
  const ensResolver = useAppSelector((state) => state.ensResolver);
  const namePrice = useAppSelector((state) => state.namePrice);
  const name = useAppSelector((state) => state.name);

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
    dispatch(updateCommitTxReceipt(txReceipt));
  };

  const setCommitSubmitTimestamp = (timestamp: Date) => {
    dispatch(updateCommitSubmitTimestamp(timestamp));
  }
  
  const setRegisterTxReceipt = (txReceipt: TransactionReceipt) => {
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

  return {
    nameRegistrationData:
      {
        commitSubmitTimestamp,
        currentRegistrationStep,
        estimatedNetworkFee,
        registrationYears,
        registrationPrice,
        registerTxReceipt,
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
    setRegisterTxReceipt,
    setCommitTxReceipt,
    setNameToRegister,
    setAsPrimaryName,
    setEnsResolver,
    setNamePrice,
  };
};
