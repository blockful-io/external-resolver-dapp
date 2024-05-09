/* eslint-disable import/named */
import { NameRegistrationAction } from "./actions";
import { EnsResolver, RegistrationStep } from "./constants";

export interface NameRegistrationData {
  currentRegistrationStep: RegistrationStep;
  registrationYears: number;
  isPrimaryName: boolean | null;
  ensResolver: EnsResolver | null;
  myData: null;
}

export const nameRegistrationInitialState: NameRegistrationData = {
  currentRegistrationStep: RegistrationStep.RegistrationYears,
  registrationYears: 1,
  isPrimaryName: null,
  ensResolver: null,
  myData: null,
};

const nameRegistrationReducer = (
  state = nameRegistrationInitialState,
  action: {
    type: NameRegistrationAction;
    payload: any;
  }
) => {
  switch (action.type) {
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
    case NameRegistrationAction["model/isPrimaryName"]:
      return {
        ...state,
        isPrimaryName: action.payload,
      };
    case NameRegistrationAction["model/ensResolver"]:
      return {
        ...state,
        ensResolver: action.payload,
      };
    default:
      return state;
  }
};
export default nameRegistrationReducer;
