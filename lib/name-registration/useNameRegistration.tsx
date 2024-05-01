"use client";

import { useAppDispatch, useAppSelector } from "../store";
import { nameRegistrationInitialState } from "./reducers";
import { updateCurrentRegistrationStep } from "./actions";
import { RegistrationStep } from "./constants";

export const useNameRegistration = (): {
  nameRegistrationData: {
    currentRegistrationStep: RegistrationStep;
  };
  setCurrentRegistrationStep: (
    currentRegistrationStep: RegistrationStep
  ) => void;
} => {
  const currentRegistrationStep = useAppSelector(
    (state) => state.currentRegistrationStep
  );
  const dispatch = useAppDispatch();

  const setCurrentRegistrationStep = (
    currentRegistrationStep: RegistrationStep
  ) => {
    dispatch(updateCurrentRegistrationStep(currentRegistrationStep));
  };

  return {
    nameRegistrationData:
      {
        currentRegistrationStep,
      } || nameRegistrationInitialState,
    setCurrentRegistrationStep,
  };
};
