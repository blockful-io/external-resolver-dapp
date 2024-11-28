import { BaseError, RawContractError } from "viem";

// Validate required environment variable is present
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
}

/**
 * Extracts revert error data from a contract error
 *
 * This function takes an unknown error and attempts to extract structured revert data
 * if it originated from a contract call. It walks the error chain to find the root
 * cause and returns the error name and arguments if available.
 *
 * @param err - The error to extract data from
 * @returns The error data containing errorName and args if available, undefined otherwise
 */
export function getRevertErrorData(err: unknown) {
  if (!(err instanceof BaseError)) return undefined;
  const error = err.walk() as RawContractError;
  return error?.data as { errorName: string; args: unknown[] };
}
