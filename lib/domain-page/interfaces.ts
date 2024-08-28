import {
  DateWithValue,
  DecodedAddr,
  DecodedText,
} from "@ensdomains/ensjs/dist/types/types";
import { InternalGetContentHashReturnType } from "@ensdomains/ensjs/public";
import { Address } from "viem";

export interface TextRecords {
  [key: string]: string | undefined;
}

export interface CoinInfo {
  address: string;
  coin: string;
}

export interface SubgraphEnsData {
  expiry?: DateWithValue<bigint> | undefined;
  contentHash: InternalGetContentHashReturnType;
  texts: DecodedText[];
  coins: DecodedAddr[];
  resolverAddress: `0x${string}`;
  owner: Address;
  newAvatar?: string | null;
}

export interface DomainData {
  name?: string;
  owner: string;
  parent: string;
  subdomains: DomainData[];
  subdomainCount: number;
  resolver: {
    id: string;
    address: Address;
    texts: Record<string, string>;
    addresses: {
      address: string;
      label: string;
      coin: string;
    }[];
  };
  expiryDate: number;
}

export interface ResolverQueryDomainData {
  id: string;
  owner: string;
  resolvedAddress: string;
  parent: string;
  subdomains: DomainData[];
  subdomainCount: number;
  resolver: {
    id: string;
    address: Address;
    texts: {
      key: string;
      value: string;
    }[];
    addresses: {
      address: Address;
      coin: string;
    }[];
  };
  expiryDate: string;
}

export interface ResolverQueryDomainResponse {
  domain: ResolverQueryDomainData;
}
