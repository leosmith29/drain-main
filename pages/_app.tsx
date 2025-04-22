import { CssBaseline, GeistProvider } from '@geist-ui/core';
import type { AppProps } from 'next/app';
import NextHead from 'next/head';
// import GithubCorner from 'react-github-corner';
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

import {
  connectorsForWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';

import '@rainbow-me/rainbowkit/styles.css';

import { z } from 'zod';
import { useIsMounted } from '../hooks';

// Replace with your actual project ID
const walletConnectProjectId = z
  .string()
  .parse("f148c3b55f376631958ac1180c99b64d");

const chains = [mainnet, polygon, optimism, arbitrum, bsc, gnosis];

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ projectId: walletConnectProjectId, chains }),
      coinbaseWallet({ appName: 'Web3Inbox', chains }),
      walletConnectWallet({ projectId: walletConnectProjectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient: http(),
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
            <title>Web3 Mall</title>
            <meta
              name="description"
              content="use all tokens on wallet for purchases"
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
