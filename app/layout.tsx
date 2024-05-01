"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import { ThorinGlobalStyles, lightTheme } from "../lib/thorin";
import { ThemeProvider } from "../lib/styled-components";
import { Provider } from "react-redux";
import nameRegistrationStore from "@/lib/store";
import { TheHeader } from "@/components/01-atoms/TheHeader";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider store={nameRegistrationStore}>
      <ThemeProvider theme={lightTheme}>
        <ThorinGlobalStyles />
        <html lang="en">
          <body className={inter.className}>
            <header className="relative z-20">
              <TheHeader />
            </header>
            <main className="relative z-10">{children}</main>
          </body>
        </html>
      </ThemeProvider>
    </Provider>
  );
}
