export enum SupportedNetwork {
  MAINNET = 1,
  TESTNET = 11155111,
}

export type SupportedNetworkIds =
  | SupportedNetwork.MAINNET
  | SupportedNetwork.TESTNET;

export const ETHEREUM_MAINNET_CHAIN_ID = SupportedNetwork.MAINNET;
export const ETHEREUM_TESTNET_CHAIN_ID = SupportedNetwork.TESTNET;
