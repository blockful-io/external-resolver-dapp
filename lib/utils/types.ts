import { Address, Hex } from "viem";

/**
 * @notice Struct used to define the domain of the typed data signature, defined in EIP-712.
 * @param name The user friendly name of the contract that the signature corresponds to.
 * @param version The version of domain object being used.
 * @param chainId The ID of the chain that the signature corresponds to (ie Ethereum mainnet: 1, Goerli testnet: 5, ...).
 * @param verifyingContract The address of the contract that the signature pertains to.
 */
export type DomainData = {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: `0x${string}`;
};

/**
 * @notice Struct used to define the message context used to construct a typed data signature, defined in EIP-712,
 * to authorize and define the deferred mutation being performed.
 * @param callData The encoded function call data of the mutation.
 * @param sender The address of the user performing the mutation (msg.sender).
 * @param expirationTimestamp The timestamp at which the mutation will expire.
 */
export type MessageData = {
  callData: `0x${string}`;
  sender: `0x${string}`;
  expirationTimestamp: bigint;
};

export type TypedSignature = {
  signature: `0x${string}`;
  domain: DomainData;
  message: MessageData;
};

export type CcipRequestParameters = {
  body: { data: Hex; signature: TypedSignature; sender: Address };
  url: string;
};
