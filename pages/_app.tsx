// 'use client';
// import { CssBaseline, GeistProvider } from '@geist-ui/core';
// import type { AppProps } from 'next/app';
// import NextHead from 'next/head';
// import '../styles/globals.css';
// import '@rainbow-me/rainbowkit/styles.css';
// import {
//   getDefaultConfig,
//   RainbowKitProvider,
// } from '@rainbow-me/rainbowkit';
// import {
//   WagmiProvider,
//   createConfig,
//   http
// } from 'wagmi';
// import {
//   mainnet,
//   polygon,
//   optimism,
//   arbitrum,
//   bsc,
//   gnosis,
// } from 'wagmi/chains';

// import { walletConnect } from '@wagmi/connectors';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


// import { z } from 'zod';
// import { useIsMounted } from '../hooks';

// // ✅ Parse WalletConnect project ID from env or constant
// const walletConnectProjectId = z
//   .string()
//   .parse("63a5cb131e7dd5b53a021c46347d190b");

// // ✅ Define supported chains
// const chains = [mainnet, polygon, optimism, arbitrum, bsc, gnosis];

// // ✅ Map transport per chain — required in Wagmi v2
// const transports = {
//   [mainnet.id]: http(),
//   [polygon.id]: http(),
//   [optimism.id]: http(),
//   [arbitrum.id]: http(),
//   [bsc.id]: http(),
//   [gnosis.id]: http(),
// };

// const config = getDefaultConfig({
//   appName: 'MyWeb3Inboc',
//   projectId: '63a5cb131e7dd5b53a021c46347d190b',
//   chains: [mainnet, polygon, optimism, arbitrum, bsc, gnosis],
//   ssr: false, // If your dApp uses server side rendering (SSR)
// });

// // ✅ Create Wagmi config
// const wagmiConfig = createConfig({
//   chains: [mainnet, polygon, optimism, arbitrum, bsc, gnosis],
//   connectors: [
//     walletConnect({
//       projectId: walletConnectProjectId,
//     }),
//   ],
//   transports,
// });

// const App = ({ Component, pageProps }: AppProps) => {
//   const isMounted = useIsMounted();
//   if (!isMounted) return null;
//   const queryClient = new QueryClient()
//   return (
//     <WagmiProvider config={config}>
//       <QueryClientProvider client={queryClient}>
//       <RainbowKitProvider>
//         <NextHead>
//           <title>Drain</title>
//           <meta
//             name="description"
//             content="Send all tokens from one wallet to another"
//           />
//           <link rel="icon" href="/favicon.ico" />
//         </NextHead>
//         <GeistProvider>
//           <CssBaseline />
//           <Component {...pageProps} />
//         </GeistProvider>
//         </RainbowKitProvider>
//       </QueryClientProvider>
//     </WagmiProvider>
//   );
// };

// export default App;

'use client';

import { CssBaseline, GeistProvider } from '@geist-ui/core';
import type { AppProps } from 'next/app';
import NextHead from 'next/head';
import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import {
  RainbowKitProvider,
  connectorsForWallets
} from '@rainbow-me/rainbowkit';

import {
  phantomWallet,
  okxWallet,
  trustWallet,
  uniswapWallet,
  binanceWallet,
  bitgetWallet,
  bybitWallet,
} from '@rainbow-me/rainbowkit/wallets';

import {
  WagmiProvider,
  createConfig,
  http
} from 'wagmi';

import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  bsc,
  gnosis,
} from 'wagmi/chains';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useIsMounted } from '../hooks';
import { z } from 'zod';

const walletConnectProjectId = z
  .string()
  .parse('63a5cb131e7dd5b53a021c46347d190b');

const chains = [mainnet, polygon, optimism, arbitrum, bsc, gnosis];

const transports = {
  [mainnet.id]: http(),
  [polygon.id]: http(),
  [optimism.id]: http(),
  [arbitrum.id]: http(),
  [bsc.id]: http(),
  [gnosis.id]: http(),
};

// Configure connectors with all custom wallets
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Supported Wallets',
      wallets: [
        phantomWallet,
        okxWallet,
        trustWallet,
        uniswapWallet,
        binanceWallet,
        bitgetWallet,
        bybitWallet,
      ],
    },
  ],
  {
    appName: 'MyWeb3Inboc',
    projectId: walletConnectProjectId,
  }
);
const wagmiConfig = createConfig({
  connectors,
  chains: [mainnet, polygon, optimism, arbitrum, bsc, gnosis],
  transports,
  ssr: false,
});

const App = ({ Component, pageProps }: AppProps) => {
  const isMounted = useIsMounted();
  if (!isMounted) return null;

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
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
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;

