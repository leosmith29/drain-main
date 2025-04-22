'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { GetTokens, SendTokens } from '../components/contract';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, isLoading, pendingConnector } = useConnect({
    connector: injected(),
  });
  const { disconnect } = useDisconnect();

  return (
    <div>
      <header style={{ padding: '1rem' }}>
        {isConnected ? (
          <div>
            <button onClick={() => disconnect()}>
              Disconnect ({address?.slice(0, 6)}...{address?.slice(-4)})
            </button>
          </div>
        ) : (
          <button onClick={() => connect()}>
            {isLoading && pendingConnector ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </header>

      <main
        style={{
          minHeight: '60vh',
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <GetTokens />
        <SendTokens />
      </main>
    </div>
  );
}
