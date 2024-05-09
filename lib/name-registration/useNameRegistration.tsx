"use client";

import { useAppDispatch, useAppSelector } from "../store";
import { nameRegistrationInitialState } from "./reducers";
import {
  updateCurrentRegistrationStep,
  updateRegistrationYears,
} from "./actions";
import { RegistrationStep } from "./constants";

export const useNameRegistration = (): {
  nameRegistrationData: {
    currentRegistrationStep: RegistrationStep;
    registrationYears: number;
  };
  setCurrentRegistrationStep: (
    currentRegistrationStep: RegistrationStep
  ) => void;
  setRegistrationYears: (registrationYears: number) => void;
} => {
  const currentRegistrationStep = useAppSelector(
    (state) => state.currentRegistrationStep
  );

  const registrationYears = useAppSelector((state) => state.registrationYears);

  const dispatch = useAppDispatch();

  const setCurrentRegistrationStep = (
    currentRegistrationStep: RegistrationStep
  ) => {
    dispatch(updateCurrentRegistrationStep(currentRegistrationStep));
  };

  const setRegistrationYears = (registrationYears: number) => {
    dispatch(updateRegistrationYears(registrationYears));
  };

  return {
    nameRegistrationData:
      {
        currentRegistrationStep,
        registrationYears,
      } || nameRegistrationInitialState,
    setCurrentRegistrationStep,
    setRegistrationYears,
  };
};
