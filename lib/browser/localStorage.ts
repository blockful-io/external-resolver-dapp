import { ENS_REGISTRATIONS_SECRET_KEY } from "@/lib/name-registration/constants";
import { createNameRegistrationSecret } from "../name-registration/blockchain-txs";

export const getNameRegistrationSecret = (): string => {
  const saltFromStorage = window.localStorage.getItem(
    ENS_REGISTRATIONS_SECRET_KEY
  );

  if (saltFromStorage) {
    return saltFromStorage;
  }

  const salt = createNameRegistrationSecret();
  window.localStorage.setItem(ENS_REGISTRATIONS_SECRET_KEY, salt);

  return salt;
};
