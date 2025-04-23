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
const walletConnectProjectId = z.string().parse('63a5cb131e7dd5b53a021c46347d190b');

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
  appName: 'MyWeb3Inboc',
  projectId: walletConnectProjectId,
  chains,
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
            <title>Drain</title>
            <meta name="description" content="Send all tokens from one wallet to another" />
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
