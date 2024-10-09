import { ConnectButton } from '@rainbow-me/rainbowkit';
import { GetTokens, SendTokens } from '../components/contract';

export default function Home() {
  return (
    <div className={''}>
      <header style={{ padding: '1rem' }}>
        
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
        <ConnectButton />
        {/* <SendTokens /> */}
      </main>
    </div>
  );
}
