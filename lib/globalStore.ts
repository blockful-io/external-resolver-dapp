import nameRegistrationReducer from "./name-registration/reducers";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { ThunkDispatch, configureStore } from "@reduxjs/toolkit";
import { Action } from "redux";

const nameRegistrationStore = configureStore({
  reducer: nameRegistrationReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "controller/namePrice",
          "controller/commitTxReceipt",
          "controller/registerTxReceipt",
          "controller/registrationPrice",
          "controller/estimatedNetworkFee",
        ],
        ignoredPaths: [
          "estimatedNetworkFee",
          "registrationPrice",
          "registerTxReceipt",
          "namePrice",
        ],
      },
    }),
});

export type RootState = ReturnType<typeof nameRegistrationStore.getState>;
export type AppDispatch = typeof nameRegistrationStore.dispatch;
type DispatchFunc = () => AppDispatch;

export const useAppDispatch: DispatchFunc = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export type ThunkAction<
  TReturnType,
  TState,
  TExtraThunkArg,
  TBasicAction extends Action
> = (
  dispatch: ThunkDispatch<TState, TExtraThunkArg, TBasicAction>,
  getState: () => TState,
  extraArgument: TExtraThunkArg
) => TReturnType;

export default nameRegistrationStore;
