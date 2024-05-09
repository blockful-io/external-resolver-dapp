"use client";

import { useAppDispatch, useAppSelector } from "../store";
import { nameRegistrationInitialState } from "./reducers";
import {
  updateCurrentRegistrationStep,
  updateIsPrimaryName,
  updateRegistrationYears,
} from "./actions";
import { RegistrationStep } from "./constants";

export const useNameRegistration = (): {
  nameRegistrationData: {
    currentRegistrationStep: RegistrationStep;
    registrationYears: number;
    isPrimaryName: boolean;
  };
  setCurrentRegistrationStep: (
    currentRegistrationStep: RegistrationStep
  ) => void;
  setRegistrationYears: (registrationYears: number) => void;
  setIsPrimaryName: (isPrimaryName: boolean) => void;
} => {
  const currentRegistrationStep = useAppSelector(
    (state) => state.currentRegistrationStep
  );
  const registrationYears = useAppSelector((state) => state.registrationYears);
  const isPrimaryName = useAppSelector((state) => state.isPrimaryName);

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

  return {
    nameRegistrationData:
      {
        currentRegistrationStep,
        registrationYears,
        isPrimaryName,
      } || nameRegistrationInitialState,
    setCurrentRegistrationStep,
    setRegistrationYears,
    setIsPrimaryName,
  };
};
