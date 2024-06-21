import "@rainbow-me/rainbowkit/styles.css";
import "tailwindcss/tailwind.css";
import "@/pages/styles/globals.css";
import { ThemeProvider } from "styled-components";
import { ThorinGlobalStyles, lightTheme } from "@ensdomains/thorin";

import {
  getSiweMessageOptions,
  queryClient,
  wagmiConfig,
} from "../lib/wallet/wallet-config";
import { WagmiProvider } from "wagmi";
import { SessionProvider } from "next-auth/react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";

import { Provider } from "react-redux";
import nameRegistrationStore from "@/lib/globalStore";

import { type AppProps } from "next/app";
import { Inter } from "next/font/google";

import { DappHeader } from "@/components/01-atoms";
import { Session } from "next-auth";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function App({
  Component,
  pageProps,
}: AppProps<{
  session: Session;
}>) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <SessionProvider session={pageProps.session}>
        <Provider store={nameRegistrationStore}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={lightTheme}>
              <ThorinGlobalStyles />
              <RainbowKitSiweNextAuthProvider
                getSiweMessageOptions={getSiweMessageOptions}
              >
                <RainbowKitProvider>
                  <div
                    style={{ background: "#fff" }}
                    className={`${inter.className} h-screen flex flex-col`}
                  >
                    <DappHeader />
                    <main>
                      <div className="relative z-10 h-full flex-grow">
                        <Toaster position="bottom-right" />
                        <Component {...pageProps} />
                      </div>
                    </main>
                  </div>
                </RainbowKitProvider>
              </RainbowKitSiweNextAuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </Provider>
      </SessionProvider>
    </WagmiProvider>
  );
}
