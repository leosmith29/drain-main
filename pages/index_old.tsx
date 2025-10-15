'use client';

import { useAccount, useConnect, useDisconnect, useReconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { GetTokens, SendTokens } from '../components/contract';
import { useIsMounted } from '../hooks';
import { useEffect } from 'react';
import { ConnectKitButton } from 'connectkit';
import Link from 'next/link';

export default function Home() {
  const isMounted = useIsMounted();

  const { address, isConnected } = useAccount();
  const { connect, connectors, status, error } = useConnect();

  // const { disconnect } = useDisconnect();
  // const { reconnect } = useReconnect();

  // useEffect(() => {
  //   reconnect();
  // }, []);

  if (!isMounted) return null; //

  return (
    <div>
      <header style={{ padding: '1rem' }}>
        {/* {isConnected ? (
          <div>
            <button onClick={() => disconnect()}>
              Disconnect ({address?.slice(0, 6)}...{address?.slice(-4)})
            </button>
          </div>
        ) : (
          <div>
            {connectors.map((connector) => (
              <button
                // disabled={!connector.ready}
                key={connector.id}
                onClick={() => connect({ connector })}
              >
                {connector.name}
                {!connector.ready && ' (unsupported)'}
                {status === 'pending' && ' (connecting)'}
              </button>
            ))}
            {error && <div style={{ color: 'red' }}>{error.message}</div>}
          </div>
        )} */}
        <ConnectKitButton />
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
      <Link href="/destination-settings">Destination Settings</Link>
    </div>
  );
}
