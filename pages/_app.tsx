import { CssBaseline, GeistProvider } from '@geist-ui/core';
import type { AppProps } from 'next/app';
import NextHead from 'next/head';
// import GithubCorner from 'react-github-corner'; // Optional
import '../styles/globals.css';

import {
  WagmiProvider,
  createConfig,
  http,
} from 'wagmi';
import {
  mainnet,
  arbitrum,
  bsc,
  gnosis,
  optimism,
  polygon,
} from 'wagmi/chains';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { z } from 'zod';
import { useIsMounted } from '../hooks';

// Replace with your actual project ID
const walletConnectProjectId = z
  .string()
  .parse("f148c3b55f376631958ac1180c99b64d");

const chains = [mainnet, polygon, optimism, arbitrum, bsc, gnosis];

const { connectors } = getDefaultWallets({
  appName: 'Web3Inbox',
  projectId: walletConnectProjectId,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: ()=> connectors(), // Ensure connectors is an array
  publicClient: http(), // uses default chain RPC URLs
});

const App = ({ Component, pageProps }: AppProps) => {
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  return (
    <>
      {/* <GithubCorner
        href="https://github.com/dawsbot/drain"
        size="140"
        bannerColor="#e056fd"
      /> */}

      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider chains={chains} coolMode>
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
        </RainbowKitProvider>
      </WagmiProvider>
    </>
  );
};

export default App;
