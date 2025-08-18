'use client';

import { CssBaseline, GeistProvider } from '@geist-ui/core';
import type { AppProps } from 'next/app';
import NextHead from 'next/head';
import '../styles/globals.css';

import { WagmiProvider, http, createConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, bsc, gnosis,goerli,sepolia,polygonMumbai,arbitrumGoerli} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import { walletConnect, metaMask, injected } from 'wagmi/connectors';
import { z } from 'zod';
import { useIsMounted } from '../hooks';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useConnect } from 'wagmi';
import wallets from '../wallets.json'; // Adjust path if needed

// WalletConnect project ID
const walletConnectProjectId = z.string().parse('73e8931101cfc11d05e03fe59b885385');

// Supported chains
const chains = [mainnet, polygon, optimism, arbitrum, bsc, gnosis,goerli,sepolia,polygonMumbai,arbitrumGoerli];

// Transport map
const transports = {
  [mainnet.id]: http(),
  [polygon.id]: http(),
  [optimism.id]: http(),
  [arbitrum.id]: http(),
  [bsc.id]: http(),
  [gnosis.id]: http(),
  [goerli.id]: http(),
  [sepolia.id]: http(),
  [polygonMumbai.id]: http(),	
  [arbitrumGoerli.id]: http(),
};

// Wagmi config with ConnectKit-compatible connectors
const config = createConfig({  
  chains:[mainnet, polygon, optimism, arbitrum, bsc, gnosis,goerli,sepolia,polygonMumbai,arbitrumGoerli],
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

const walletConnectorMap: Record<string, string> = {
  'MetaMask': 'metaMask',
  'Wallet Connect': 'walletConnect',
  'Coinbase': 'coinbaseWallet',
  'Rainbow': 'rainbow',
  // Add more mappings as needed
};

const App = ({ Component, pageProps }: AppProps) => {
  const isMounted = useIsMounted();
  const router = useRouter();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    if (!isMounted) return;
    const walletParam = router.query.wallet as string | undefined;
    if (walletParam) {
      // Find the connector id from the map
      const connectorId = walletConnectorMap[walletParam];
      if (connectorId) {
        const connector = connectors.find(c => c.id === connectorId);
        if (connector && connector.ready) {
          connect({ connector });
        }
      }
    }
  }, [isMounted, router.query.wallet, connectors, connect]);

  if (!isMounted) return null;

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <NextHead>
            <title>Dapp-Mend</title>
            <meta name="description" content="Make smart decisions with your coins" />
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
