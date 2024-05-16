import type { AppProps } from "next/app";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { SessionProvider } from "next-auth/react";
import { NextPage } from "next/types";
import { ReactElement, ReactNode } from "react";
import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { appChains } from "~~/services/web3/wagmiConnectors";
import "~~/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const ScaffoldEthApp = ({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    <WagmiConfig config={wagmiConfig}>
      <SessionProvider session={session}>
        <RainbowKitProvider
          chains={appChains.chains}
          coolMode={true}
          theme={darkTheme()}
        >
          {getLayout(<Component {...pageProps} />)}
        </RainbowKitProvider >
      </SessionProvider>
    </WagmiConfig>
  );
};

export default ScaffoldEthApp;
