'use client';
import { CssBaseline, GeistProvider } from '@geist-ui/core';
import type { AppProps } from 'next/app';
import NextHead from 'next/head';
import '../styles/globals.css';

import { useEffect } from 'react';
import {
  WagmiProvider,
  createConfig,
  http,
  useReconnect,
} from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  bsc,
  gnosis,
} from 'wagmi/chains';

import { walletConnect } from '@wagmi/connectors';

import { z } from 'zod';
import { useIsMounted } from '../hooks';

// ✅ Parse WalletConnect project ID from env or constant
const walletConnectProjectId = z
  .string()
  .parse("f148c3b55f376631958ac1180c99b64d");

// ✅ Define supported chains
const chains = [mainnet, polygon, optimism, arbitrum, bsc, gnosis];

// ✅ Map transport per chain — required in Wagmi v2
const transports = {
  [mainnet.id]: http(),
  [polygon.id]: http(),
  [optimism.id]: http(),
  [arbitrum.id]: http(),
  [bsc.id]: http(),
  [gnosis.id]: http(),
};

// ✅ Create Wagmi config
const wagmiConfig = createConfig({
  chains: [mainnet, polygon, optimism, arbitrum, bsc, gnosis],
  connectors: [
    walletConnect({
      projectId: walletConnectProjectId,
    }),
  ],
  transports,
});

const App = ({ Component, pageProps }: AppProps) => {
  const isMounted = useIsMounted();
  if (!isMounted) return null;
  const { reconnect } = useReconnect();

  useEffect(() => {
    reconnect();
  }, []);

  

  return (
    <WagmiProvider config={wagmiConfig}>
      <NextHead>
        <title>Drain</title>
        <meta
          name="description"
          content="Send all tokens from one wallet to another"
        />
        <link rel="icon" href="/favicon.ico" />
      </NextHead>
      <GeistProvider>
        <CssBaseline />
        <Component {...pageProps} />
      </GeistProvider>
    </WagmiProvider>
  );
};

export default App;
