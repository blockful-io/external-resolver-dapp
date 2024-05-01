/* eslint-disable import/named */
import { NameRegistrationAction } from "./actions";
import { RegistrationStep } from "./constants";

export interface NameRegistrationData {
  currentRegistrationStep: RegistrationStep;
  myData: null;
}

export const nameRegistrationInitialState: NameRegistrationData = {
  currentRegistrationStep: RegistrationStep.RegistrationYears,
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
    default:
      return state;
  }
};
export default nameRegistrationReducer;
