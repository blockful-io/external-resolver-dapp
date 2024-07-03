import { metaMaskWallet, rainbowWallet } from "@rainbow-me/rainbowkit/wallets";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { createClient, createPublicClient, createWalletClient } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { createConfig, http } from "wagmi";
import { isTestnet } from "./chains";
import { QueryClient } from "@tanstack/react-query";
import { addEnsContracts, createEnsPublicClient } from "@ensdomains/ensjs";
import { ENS_ENDPOINT } from "../utils/ens";

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
const alchemyApiTestnetKey = process.env.NEXT_PUBLIC_ALCHEMY_TESTNET_KEY;
const ensKey = process.env.NEXT_PUBLIC_ENS_SUBGRAPH_KEY;

const mainnetWithEns = addEnsContracts(mainnet);
const sepoliaWithEns = addEnsContracts(sepolia);

const chain = {
  ...(isTestnet ? sepoliaWithEns : mainnetWithEns),
  subgraphs: {
    ens: {
      url: ENS_ENDPOINT,
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
  ? "https://public.stackup.sh/api/v1/node/ethereum-sepolia"
  : `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;

// Create a public client for fetching data from the blockchain
export const publicClient = createPublicClient({
  chain: addEnsContracts(isTestnet ? sepolia : mainnet),
  batch: { multicall: true },
  transport: http(),
});

export const client = createClient({
  chain: chain,
  transport: http(),
});

// Create a wallet client for sending transactions to the blockchain
export const walletClient = createWalletClient({
  chain: isTestnet ? sepolia : mainnet,
  transport: http(rpcHttpUrl),
});

export const ensPublicClient = createEnsPublicClient({
  chain: chain,
  transport: http(),
});

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
  chains: [isTestnet ? sepolia : mainnet],
  transports: {
    [mainnet.id]: http(rpcHttpUrl),
    [sepolia.id]: http(rpcHttpUrl),
  },
  ssr: false,
});

// Create a app config for Siwe (Wallet Authentication)
const getSiweMessageOptions = () => ({
  statement: "Connect to ENS External Domain Resolver dApp",
});

// Create the query client for React Query
const queryClient = new QueryClient();

export { wagmiConfig, getSiweMessageOptions, queryClient };
