import { BaseError } from "viem";

export enum TransactionErrorType {
  UNKNOWN = "unknown",
  REVERTED = "reverted",
  DECLINED = "declined",
  NO_MATCHING_KEY = "no_matching_key",
  INSUFFICIENT_BALANCE = "insuficcient_balance",
}

const namesForRevertedTxStatus = ["reverted"];

const namesForDeclinedTxStatus = [
  "cancelled",
  "declined",
  "rejected",
  "denied",
];

export const getBlockchainTransactionError = (
  error: any,
): TransactionErrorType => {
  if (
    namesForRevertedTxStatus.some(
      (nameForRevertedTxStatus) => error.status === nameForRevertedTxStatus,
    )
  ) {
    return TransactionErrorType.REVERTED;
  } else if (
    namesForDeclinedTxStatus.some((nameForDeclinedTxStatus: string) => {
      return (
        (error as BaseError).details &&
        (error as BaseError).details.includes(nameForDeclinedTxStatus)
      );
    })
  ) {
    return TransactionErrorType.DECLINED;
  } else if (
    (error as BaseError).details &&
    (error as BaseError).details.includes("insufficient")
  ) {
    return TransactionErrorType.INSUFFICIENT_BALANCE;
  } else {
    return TransactionErrorType.UNKNOWN;
  }
};
