import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";
import { PublicClient } from "viem";

export type EnsPublicClient = PublicClient & ClientWithEns;

export interface NamePrice {
  base: bigint;
  premium: bigint;
}
