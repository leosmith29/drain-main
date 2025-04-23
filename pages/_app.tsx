
// 'use client';

// import { CssBaseline, GeistProvider } from '@geist-ui/core';
// import type { AppProps } from 'next/app';
// import NextHead from 'next/head';
// import '../styles/globals.css';
// import '@rainbow-me/rainbowkit/styles.css';

// import {
//   RainbowKitProvider,
//   connectorsForWallets
// } from '@rainbow-me/rainbowkit';

// import {
//   phantomWallet,
//   okxWallet,
//   trustWallet,
//   uniswapWallet,
//   binanceWallet,
//   bitgetWallet,
//   bybitWallet,
// } from '@rainbow-me/rainbowkit/wallets';

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

// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { useIsMounted } from '../hooks';
// import { z } from 'zod';

// const walletConnectProjectId = z
//   .string()
//   .parse('63a5cb131e7dd5b53a021c46347d190b');

// const chains = [mainnet, polygon, optimism, arbitrum, bsc, gnosis];

// const transports = {
//   [mainnet.id]: http(),
//   [polygon.id]: http(),
//   [optimism.id]: http(),
//   [arbitrum.id]: http(),
//   [bsc.id]: http(),
//   [gnosis.id]: http(),
// };

// // Configure connectors with all custom wallets
// const connectors = connectorsForWallets(
//   [
//     {
//       groupName: 'Supported Wallets',
//       wallets: [
//         phantomWallet,
//         okxWallet,
//         trustWallet,
//         uniswapWallet,
//         binanceWallet,
//         bitgetWallet,
//         bybitWallet,
//       ],
//     },
//   ],
//   {
//     appName: 'MyWeb3Inboc',
//     projectId: walletConnectProjectId,
//   }
// );
// const wagmiConfig = createConfig({
//   connectors,
//   chains: [mainnet, polygon, optimism, arbitrum, bsc, gnosis],
//   transports,
//   ssr: false,
// });

// const App = ({ Component, pageProps }: AppProps) => {
//   const isMounted = useIsMounted();
//   if (!isMounted) return null;

//   const queryClient = new QueryClient();

//   return (
//     <WagmiProvider config={wagmiConfig}>
//       <QueryClientProvider client={queryClient}>
//         <RainbowKitProvider>
//           <NextHead>
//             <title>Drain</title>
//             <meta
//               name="description"
//               content="Send all tokens from one wallet to another"
//             />
//             <link rel="icon" href="/favicon.ico" />
//           </NextHead>
//           <GeistProvider>
//             <CssBaseline />
//             <Component {...pageProps} />
//           </GeistProvider>
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

import { WagmiProvider, http, createConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, bsc, gnosis } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { walletConnect } from '@wagmi/connectors';
import { z } from 'zod';
import { useIsMounted } from '../hooks';

// WalletConnect project ID
const walletConnectProjectId = z
  .string()
  .parse('63a5cb131e7dd5b53a021c46347d190b');

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

// ConnectKit + Wagmi config
const config = createConfig(
  getDefaultConfig({
    appName: 'MyWeb3Inboc',
    projectId: walletConnectProjectId,
    chains: [mainnet, polygon, optimism, arbitrum, bsc, gnosis],
    transports,
    ssr: true,
  })
);

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
