/* eslint-disable import/named */
import { RootState } from "../store";
import { ThunkAction } from "redux-thunk";
import { EnsResolver, RegistrationStep } from "./constants";
import { Action } from "redux";

// Action types
export enum NameRegistrationAction {
  "model/currentRegistrationStep" = "model/currentRegistrationStep",
  "model/registrationYears" = "model/registrationYears",
  "model/isPrimaryName" = "model/isPrimaryName",
  "model/ensResolver" = "model/ensResolver",
}

// Actions
export const updateCurrentRegistrationStep = (
  currentRegistrationStep: RegistrationStep
) => ({
  type: NameRegistrationAction["model/currentRegistrationStep"],
  payload: currentRegistrationStep,
});

export const updateRegistrationYears = (registrationYears: number) => ({
  type: NameRegistrationAction["model/registrationYears"],
  payload: registrationYears,
});

export const updateIsPrimaryName = (isPrimaryName: boolean) => ({
  type: NameRegistrationAction["model/isPrimaryName"],
  payload: isPrimaryName,
});

export const updateEnsResolver = (ensResolver: EnsResolver) => ({
  type: NameRegistrationAction["model/ensResolver"],
  payload: ensResolver,
});

/*
  Thunk Actions

  Redux Thunk is the standard middleware for writing sync and async logic
  that interacts with the Redux store (https://github.com/reduxjs/redux-thunk)
*/
export const doLogicsAndDispatchActions =
  (newQuery: string): ThunkAction<void, RootState, unknown, Action<string>> =>
  async (dispatch, state) => {
    // This is an example of a thunk action that dispatches an action
  };
