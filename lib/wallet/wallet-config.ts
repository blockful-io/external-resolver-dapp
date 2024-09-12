import { metaMaskWallet, rainbowWallet } from "@rainbow-me/rainbowkit/wallets";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "viem/chains";
import { createConfig, http } from "wagmi";
import { isTestnet } from "./chains";
import { QueryClient } from "@tanstack/react-query";
import { addEnsContracts } from "@ensdomains/ensjs";

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
const alchemyApiTestnetKey = process.env.NEXT_PUBLIC_ALCHEMY_TESTNET_KEY;

const mainnetWithEns = addEnsContracts(mainnet);
const sepoliaWithEns = addEnsContracts(sepolia);

if (isTestnet && alchemyApiTestnetKey == undefined) {
  throw new Error("Missing API key for testnet environment");
}

if (!isTestnet && alchemyApiKey == undefined) {
  throw new Error("Missing API key for mainnet environment");
}

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

// Create the query client for React Query
const queryClient = new QueryClient();

export { wagmiConfig, queryClient };
