/* eslint-disable import/named */
import { ENSName, buildENSName } from "@namehash/ens-utils";
import { NameRegistrationAction } from "./actions";
import { EnsResolver, RegistrationStep } from "./constants";
import { TransactionReceipt } from "viem";
import { endNameRegistrationPreviouslyOpen } from "./localStorage";

export interface NameRegistrationData {
  textRecords: Record<string, string>;
  domainAddresses: Record<string, string>;
  currentRegistrationStep: RegistrationStep;
  registrationYears: number;
  name: ENSName | null;
  asPrimaryName: boolean;
  namePrice: bigint | null;
  ensResolver: EnsResolver | null;
  registrationPrice: bigint | null;
  estimatedNetworkFee: bigint | null;
  commitTxReceipt: null | TransactionReceipt;
  commitSubmitTimestamp: null | Date;
  registerTxReceipt: null | TransactionReceipt;
}

export const nameRegistrationInitialState: NameRegistrationData = {
  currentRegistrationStep: RegistrationStep.Registered,
  estimatedNetworkFee: null,
  registrationPrice: null,
  registerTxReceipt: null,
  commitTxReceipt: null,
  textRecords: {},
  domainAddresses: {},
  commitSubmitTimestamp: null,
  registrationYears: 1,
  asPrimaryName: false,
  ensResolver: EnsResolver.Database,
  namePrice: null,
  name: buildENSName("heyyo.eth"),
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
    case NameRegistrationAction["controller/textRecords"]:
      return {
        ...state,
        textRecords: action.payload,
      };
    case NameRegistrationAction["controller/domainAddresses"]:
      return {
        ...state,
        domainAddresses: action.payload,
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
    case NameRegistrationAction["controller/registerTxReceipt"]:
      return {
        ...state,
        registerTxReceipt: action.payload,
      };
    case NameRegistrationAction["controller/commitTxReceipt"]:
      return {
        ...state,
        commitTxReceipt: action.payload,
      };
    case NameRegistrationAction["controller/commitSubmitTimestamp"]:
      return {
        ...state,
        commitSubmitTimestamp: action.payload,
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
        ...nameRegistrationInitialState,
        name: action.payload,
      };
    default:
      return state;
  }
};
export default nameRegistrationReducer;
