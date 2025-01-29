import './polyfills';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DAppKitProvider } from '@vechain/dapp-kit-react';
import App from './App';
import './index.css';

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error('Missing VITE_WALLET_CONNECT_PROJECT_ID environment variable');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DAppKitProvider
      nodeUrl="https://mainnet.vechain.org"
      genesis="main"
      usePersistence={true}
    >
      <App />
    </DAppKitProvider>
  </StrictMode>
);