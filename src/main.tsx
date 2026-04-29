import './polyfills';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DAppKitProvider } from '@vechain/dapp-kit-react';
import App from './App';
import './index.css';

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error('Missing VITE_WALLET_CONNECT_PROJECT_ID environment variable');
}

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DAppKitProvider
      nodeUrl="https://mainnet.vechain.org"
      genesis="main"
      usePersistence={true}
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </DAppKitProvider>
  </StrictMode>
);
