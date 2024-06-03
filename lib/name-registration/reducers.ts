/* eslint-disable import/named */
import { ENSName } from "@namehash/ens-utils";
import { NameRegistrationAction } from "./actions";
import { EnsResolver, RegistrationStep } from "./constants";
import { TransactionReceipt } from "viem";

export interface NameRegistrationData {
  currentRegistrationStep: RegistrationStep;
  registrationYears: number;
  name: ENSName | null;
  asPrimaryName: boolean;
  namePrice: bigint | null;
  ensResolver: EnsResolver | null;
  registrationPrice: bigint | null;
  estimatedNetworkFee: bigint | null;
  commitTxReceipt: null | TransactionReceipt;
}

export const nameRegistrationInitialState: NameRegistrationData = {
  currentRegistrationStep: RegistrationStep.RegistrationYears,
  estimatedNetworkFee: null,
  registrationPrice: null,
  commitTxReceipt: null,
  registrationYears: 1,
  asPrimaryName: false,
  ensResolver: null,
  namePrice: null,
  name: null,
};

const nameRegistrationReducer = (
  state = nameRegistrationInitialState,
  action: {
    type: NameRegistrationAction;
    payload: any;
  }
) => {
  switch (action.type) {
    case NameRegistrationAction["controller/registrationPrice"]:
      return {
        ...state,
        registrationPrice: action.payload,
      };
    case NameRegistrationAction["controller/estimatedNetworkFee"]:
      return {
        ...state,
        estimatedNetworkFee: action.payload,
      };
    case NameRegistrationAction["controller/namePrice"]:
      return {
        ...state,
        namePrice: action.payload,
      };
    case NameRegistrationAction["controller/commitTxReceipt"]:
      return {
        ...state,
        commitTxReceipt: action.payload,
      };
    case NameRegistrationAction["model/currentRegistrationStep"]:
      return {
        ...state,
        currentRegistrationStep: action.payload,
      };
    case NameRegistrationAction["model/registrationYears"]:
      return {
        ...state,
        registrationYears: action.payload,
      };
    case NameRegistrationAction["model/asPrimaryName"]:
      return {
        ...state,
        asPrimaryName: action.payload,
      };
    case NameRegistrationAction["model/ensResolver"]:
      return {
        ...state,
        ensResolver: action.payload,
      };
    case NameRegistrationAction["model/name"]:
      return {
        ...state,
        name: action.payload,
      };
    default:
      return state;
  }
};
export default nameRegistrationReducer;
