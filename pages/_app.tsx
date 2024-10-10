import "tailwindcss/tailwind.css";
import "@/pages/styles/globals.css";
import "./fonts/css/satoshi.css";
import "@rainbow-me/rainbowkit/styles.css";
import { ThemeProvider } from "styled-components";
import { ThorinGlobalStyles, lightTheme } from "@ensdomains/thorin";

import { queryClient, wagmiConfig } from "../lib/wallet/wallet-config";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClientProvider } from "@tanstack/react-query";

import { Provider } from "react-redux";
import nameRegistrationStore from "@/lib/globalStore";

import { type AppProps } from "next/app";

import { DappHeader } from "@/components/01-atoms";
import { Toaster } from "react-hot-toast";
import localFont from "@next/font/local";
import ChainChecker from "@/components/organisms/ChainChecker";

const satoshiFont = localFont({
  src: [
    {
      path: "./fonts/fonts/Satoshi-Light.ttf",
      weight: "400",
    },
    {
      path: "./fonts/fonts/Satoshi-Regular.ttf",
      weight: "500",
    },
    {
      path: "./fonts/fonts/Satoshi-Medium.ttf",
      weight: "600",
    },
    {
      path: "./fonts/fonts/Satoshi-Bold.ttf",
      weight: "700",
    },
    {
      path: "./fonts/fonts/Satoshi-Black.ttf",
      weight: "800",
    },
  ],
  variable: "--font-satoshi",
});

// Below declaration helps the application on JSON serialization of BigInt
declare global {
  interface BigInt {
    toJSON: () => string;
  }
  interface window {
    ethereum: any;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <Provider store={nameRegistrationStore}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={lightTheme}>
            <ThorinGlobalStyles />
            <RainbowKitProvider>
              <div
                style={{ background: "#fff" }}
                className={`${satoshiFont.variable} min-h-screen flex flex-col`}
              >
                <DappHeader />
                <main>
                  <Toaster position="bottom-right" />
                  <div className="relative z-10 h-full flex-grow">
                    <ChainChecker />
                    <Component {...pageProps} />
                  </div>
                </main>
              </div>
            </RainbowKitProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </WagmiProvider>
  );
}
