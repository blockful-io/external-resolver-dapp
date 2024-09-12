import { metaMaskWallet, rainbowWallet } from "@rainbow-me/rainbowkit/wallets";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { createClient, createPublicClient, createWalletClient } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { createConfig, http, useWalletClient } from "wagmi";
import { isTestnet } from "./chains";
import { QueryClient } from "@tanstack/react-query";
import { addEnsContracts } from "@ensdomains/ensjs";

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
const alchemyApiTestnetKey = process.env.NEXT_PUBLIC_ALCHEMY_TESTNET_KEY;

const mainnetWithEns = addEnsContracts(mainnet);
const sepoliaWithEns = addEnsContracts(sepolia);

const ensSubgraphApiKey = process.env.NEXT_PUBLIC_ENS_SUBGRAPH_KEY;

const ENS_SUBGRAPH_ENDPOINT = isTestnet
  ? `https://gateway-arbitrum.network.thegraph.com/api/${ensSubgraphApiKey}/subgraphs/id/DmMXLtMZnGbQXASJ7p1jfzLUbBYnYUD9zNBTxpkjHYXV`
  : `https://gateway-arbitrum.network.thegraph.com/api/${ensSubgraphApiKey}/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH`;

export const chain = {
  ...(isTestnet ? sepoliaWithEns : mainnetWithEns),
  subgraphs: {
    ens: {
      url: ENS_SUBGRAPH_ENDPOINT,
    },
  },
};

if (isTestnet && alchemyApiTestnetKey == undefined) {
  throw new Error("Missing API key for testnet environment");
}

if (!isTestnet && alchemyApiKey == undefined) {
  throw new Error("Missing API key for mainnet environment");
}

// Define the RPC URL for the blockchain in use
export const rpcHttpUrl = isTestnet
  ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
  : `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;

// Create a app config for Wagmi
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
if (!projectId) throw new Error("Missing WalletConnect project ID");
const appName = "ENS External Domain Resolver";
const connectors = connectorsForWallets(
  [
    {
      groupName: "Which wallet will you use?",
      wallets: [metaMaskWallet, rainbowWallet],
    },
  ],
  {
    projectId,
    appName,
  }
);

const wagmiConfig = createConfig({
  connectors,
  chains: [sepoliaWithEns, mainnetWithEns],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
  },
  ssr: false,
});

// Remove these lines
export const publicClient = createPublicClient({
  chain: chain,
  batch: { multicall: true },
  transport: http(rpcHttpUrl),
});

export const client = createClient({
  chain: chain,
  transport: http(rpcHttpUrl),
});

// Create a wallet client for sending transactions to the blockchain
export const walletClient = createWalletClient({
  chain: chain,
  transport: http(rpcHttpUrl),
});

// Create the query client for React Query
const queryClient = new QueryClient();

export { wagmiConfig, queryClient };
