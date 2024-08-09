import { ENSName } from "@namehash/ens-utils";
import {
  ENS_REGISTRATIONS_SECRET_KEY,
  OPEN_REGISTRATIONS_LOCAL_STORAGE_KEY,
} from "@/lib/name-registration/constants";
import { createNameRegistrationSecret } from "@/lib/utils/blockchain-txs";
import { LocalRegistrationNameData } from "./types";

// GET
export const getOpenNameRegistrations = (): Record<string, any> => {
  const cartData = window.localStorage.getItem(
    OPEN_REGISTRATIONS_LOCAL_STORAGE_KEY
  );
  return !!cartData ? JSON.parse(cartData) : {};
};

// GET (by wallet)
const getOpenNameRegistrationsForAuthedUser = (
  authedUser: `0x${string}`
): Record<string, LocalRegistrationNameData> => {
  const openNameRegistrations = getOpenNameRegistrations();
  return openNameRegistrations[authedUser] || {};
};

// GET (by wallet, by name)
export const getOpenNameRegistrationsOfNameByWallet = (
  authedUser: `0x${string}`,
  name: ENSName
): LocalRegistrationNameData => {
  const walletNameRegistrations =
    getOpenNameRegistrationsForAuthedUser(authedUser);
  return walletNameRegistrations[name.name] || {};
};

// POST
export const setNameRegistrationInLocalStorage = (
  authedUser: `0x${string}`,
  name: ENSName,
  newData: Partial<LocalRegistrationNameData>
): void => {
  const openNameRegistrationsForWallet =
    getOpenNameRegistrationsForAuthedUser(authedUser);
  const nameRegistrationData = getOpenNameRegistrationsOfNameByWallet(
    authedUser,
    name
  );

  const newObj = {
    [authedUser]: {
      ...openNameRegistrationsForWallet,
      [name.name]: {
        ...nameRegistrationData,
        ...newData,
      },
    },
  };
  window.localStorage.setItem(
    OPEN_REGISTRATIONS_LOCAL_STORAGE_KEY,
    JSON.stringify(newObj)
  );
};

// DELETE
export const endNameRegistrationPreviouslyOpen = (
  authedUser: `0x${string}`,
  name: ENSName
): void => {
  const openNameRegistrations = getOpenNameRegistrations();

  if (openNameRegistrations) {
    const openNameRegistrationsForAuthedUser =
      getOpenNameRegistrationsForAuthedUser(authedUser);

    if (openNameRegistrationsForAuthedUser) {
      delete openNameRegistrationsForAuthedUser[name.name];

      const updatedOpenRegistrations = {
        ...openNameRegistrations,
        [authedUser]: {
          ...openNameRegistrationsForAuthedUser,
        },
      };
      window.localStorage.setItem(
        OPEN_REGISTRATIONS_LOCAL_STORAGE_KEY,
        JSON.stringify(updatedOpenRegistrations)
      );
    }
  }
};

// PUT
export const updateNameRegistrationInLocalStorage = (
  authedUser: `0x${string}`,
  name: ENSName,
  newData: LocalRegistrationNameData
): void => {
  const openNameRegistrations =
    getOpenNameRegistrationsForAuthedUser(authedUser);

  const updatedNameRegistrations = {
    ...openNameRegistrations,
    ...newData,
  };

  setNameRegistrationInLocalStorage(authedUser, name, updatedNameRegistrations);
};

export const getNameRegistrationSecret = (): string => {
  const saltFromStorage = window.localStorage.getItem(
    ENS_REGISTRATIONS_SECRET_KEY
  );

  if (saltFromStorage) {
    return saltFromStorage;
  }

  const salt = createNameRegistrationSecret();
  setNameRegistrationSecret(salt);

  return salt;
};

export const setNameRegistrationSecret = (secret: string): void => {
  window.localStorage.setItem(ENS_REGISTRATIONS_SECRET_KEY, secret);
};
