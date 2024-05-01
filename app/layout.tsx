"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import { ThorinGlobalStyles, lightTheme } from "../lib/thorin";
import { ThemeProvider } from "./styled-components";
import { Provider } from "react-redux";
import nameRegistrationStore from "@/lib/store";

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
          <body className={inter.className}>{children}</body>
        </html>
      </ThemeProvider>
    </Provider>
  );
}
