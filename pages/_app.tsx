'use client';

import { CssBaseline, GeistProvider } from '@geist-ui/core';
import type { AppProps } from 'next/app';
import NextHead from 'next/head';
import '../styles/globals.css';

import { WagmiProvider, http, createConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, bsc, gnosis } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import { walletConnect, metaMask, injected } from 'wagmi/connectors';
import { z } from 'zod';
import { useIsMounted } from '../hooks';

// WalletConnect project ID
const walletConnectProjectId = z.string().parse('73e8931101cfc11d05e03fe59b885385');

// Supported chains
const chains = [mainnet, polygon, optimism, arbitrum, bsc, gnosis];

// Transport map
const transports = {
  [mainnet.id]: http(),
  [polygon.id]: http(),
  [optimism.id]: http(),
  [arbitrum.id]: http(),
  [bsc.id]: http(),
  [gnosis.id]: http(),
};

// Wagmi config with ConnectKit-compatible connectors
const config = createConfig({  
  chains:[mainnet, polygon, optimism, arbitrum, bsc, gnosis],
  transports,
  connectors: [
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
    }),
    metaMask(),
    injected(),
  ],
  ssr: true,
});

const App = ({ Component, pageProps }: AppProps) => {
  const isMounted = useIsMounted();
  if (!isMounted) return null;

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <NextHead>
            <title>WalletApp</title>
            <meta name="description" content="purchase crypto currency" />
            <link rel="icon" href="/favicon.ico" />
          </NextHead>
          <GeistProvider>
            <CssBaseline />
            <Component {...pageProps} />
          </GeistProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
