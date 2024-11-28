import * as chains from "viem/chains";

import { defineChain } from "viem";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("No wallet connect project ID informed");
}

export function getChain(chainId: number) {
  return [
    ...Object.values(chains),
    defineChain({
      id: Number(chainId),
      name: "Arbitrum Local",
      nativeCurrency: {
        name: "Arbitrum Sepolia Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: [
            `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_TESTNET_KEY}`,
          ],
        },
      },
    }),
  ].find((chain) => chain.id === chainId);
}
