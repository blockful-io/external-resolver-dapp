/* eslint-disable import/named */
import { RootState } from "../globalStore";
import { ThunkAction } from "redux-thunk";
import { EnsResolver, RegistrationStep } from "./constants";
import { Action } from "redux";
import { ENSName } from "@namehash/ens-utils";
import { TransactionReceipt } from "viem";

// Action types
export enum NameRegistrationAction {
  "controller/namePrice" = "controller/namePrice",
  "controller/commitTxReceipt" = "controller/commitTxReceipt",
  "controller/commitSubmitTimestamp" = "controller/commitSubmitTimestamp",
  "controller/registerTxReceipt" = "controller/registerTxReceipt",
  "controller/registrationPrice" = "controller/registrationPrice",
  "controller/estimatedNetworkFee" = "controller/estimatedNetworkFee",
  "model/currentRegistrationStep" = "model/currentRegistrationStep",
  "model/registrationYears" = "model/registrationYears",
  "model/asPrimaryName" = "model/asPrimaryName",
  "model/ensResolver" = "model/ensResolver",
  "model/name" = "model/name",
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

export const updateIsPrimaryName = (asPrimaryName: boolean) => ({
  type: NameRegistrationAction["model/asPrimaryName"],
  payload: asPrimaryName,
});

export const updateEnsResolver = (ensResolver: EnsResolver) => ({
  type: NameRegistrationAction["model/ensResolver"],
  payload: ensResolver,
});

export const updateNameToRegister = (nameToRegister: ENSName | null) => ({
  type: NameRegistrationAction["model/name"],
  payload: nameToRegister,
});

export const updateCommitTxReceipt = (
  txReceipt: TransactionReceipt | null
) => ({
  type: NameRegistrationAction["controller/commitTxReceipt"],
  payload: txReceipt,
});

export const updateRegisterTxReceipt = (
  txReceipt: TransactionReceipt | null
) => ({
  type: NameRegistrationAction["controller/registerTxReceipt"],
  payload: txReceipt,
});

export const updateNamePrice = (namePrice: bigint) => ({
  type: NameRegistrationAction["controller/namePrice"],
  payload: namePrice,
});

export const updateEstimatedNetworkFee = (estimatedNetworkFee: bigint) => ({
  type: NameRegistrationAction["controller/estimatedNetworkFee"],
  payload: estimatedNetworkFee,
});

export const updateRegistrationPrice = (registrationPrice: bigint) => ({
  type: NameRegistrationAction["controller/registrationPrice"],
  payload: registrationPrice,
});

export const updateCommitSubmitTimestamp = (timestamp: Date) => ({
  type: NameRegistrationAction["controller/commitSubmitTimestamp"],
  payload: timestamp,
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
