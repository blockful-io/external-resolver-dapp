import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";
import { ENSName } from "@namehash/ens-utils";
import { PublicClient } from "viem";

export type EnsPublicClient = PublicClient & ClientWithEns;

export interface NamePrice {
  base: bigint;
  premium: bigint;
}
