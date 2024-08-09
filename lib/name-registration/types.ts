import { ENSName } from "@namehash/ens-utils";
import { TransactionReceipt } from "viem";
import { EnsResolver } from "./constants";

export type LocalNameRegistrationData = {
  name?: ENSName;
  commitTxReceipt?: TransactionReceipt;
  recordsTxReceipt?: TransactionReceipt;
  secret?: string;
  registrationYears?: number;
  asPrimaryName?: boolean;
  ensResolver?: EnsResolver;
  commitTimestamp?: Date;
  textRecords?: Record<string, string>;
  domainAddresses?: Record<string, string>;
  timerDone: boolean;
};
