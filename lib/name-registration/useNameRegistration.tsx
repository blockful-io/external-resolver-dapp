"use client";

import { useAppDispatch, useAppSelector } from "../store";
import { nameRegistrationInitialState } from "./reducers";
import {
  updateCurrentRegistrationStep,
  updateEnsResolver,
  updateIsPrimaryName,
  updateRegistrationYears,
} from "./actions";
import { EnsResolver, RegistrationStep } from "./constants";

export const useNameRegistration = (): {
  nameRegistrationData: {
    currentRegistrationStep: RegistrationStep;
    registrationYears: number;
    isPrimaryName: boolean;
    ensResolver: EnsResolver;
  };
  setCurrentRegistrationStep: (
    currentRegistrationStep: RegistrationStep
  ) => void;
  setRegistrationYears: (registrationYears: number) => void;
  setIsPrimaryName: (isPrimaryName: boolean) => void;
  setEnsResolver: (ensResolver: EnsResolver) => void;
} => {
  const currentRegistrationStep = useAppSelector(
    (state) => state.currentRegistrationStep
  );
  const registrationYears = useAppSelector((state) => state.registrationYears);
  const isPrimaryName = useAppSelector((state) => state.isPrimaryName);
  const ensResolver = useAppSelector((state) => state.ensResolver);

  const dispatch = useAppDispatch();

  const setCurrentRegistrationStep = (
    currentRegistrationStep: RegistrationStep
  ) => {
    dispatch(updateCurrentRegistrationStep(currentRegistrationStep));
  };

  const setRegistrationYears = (registrationYears: number) => {
    dispatch(updateRegistrationYears(registrationYears));
  };

  const setIsPrimaryName = (isPrimaryName: boolean) => {
    dispatch(updateIsPrimaryName(isPrimaryName));
  };

  const setEnsResolver = (ensResolver: EnsResolver) => {
    dispatch(updateEnsResolver(ensResolver));
  };

  return {
    nameRegistrationData:
      {
        currentRegistrationStep,
        registrationYears,
        isPrimaryName,
        ensResolver,
      } || nameRegistrationInitialState,
    setCurrentRegistrationStep,
    setRegistrationYears,
    setIsPrimaryName,
    setEnsResolver,
  };
};
