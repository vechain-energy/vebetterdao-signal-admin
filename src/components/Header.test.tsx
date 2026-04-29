// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from './Header';
import { DEFAULT_ADMIN_ROLE, SIGNALER_ROLE } from '../lib/signalAuthorization';

const mockDappKit = vi.hoisted(() => {
  const state = {
    account: null as string | null,
    roleResults: {} as Record<string, boolean>,
    shouldReject: false,
  };

  return {
    state,
    call: vi.fn(async (role: string) => {
      if (state.shouldReject) {
        throw new Error('Role read failed');
      }

      return {
        decoded: {
          hasRole: state.roleResults[role] ?? false,
        },
      };
    }),
  };
});

vi.mock('@vechain/dapp-kit-react', () => ({
  useWallet: () => ({
    account: mockDappKit.state.account,
  }),
  useConnex: () => ({
    thor: {
      account: () => ({
        method: () => ({
          call: mockDappKit.call,
        }),
      }),
    },
  }),
  WalletButton: () => <button type="button">Wallet</button>,
}));

function renderHeader() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Header />
    </QueryClientProvider>
  );
}

describe('Header', () => {
  beforeEach(() => {
    mockDappKit.state.account = null;
    mockDappKit.state.roleResults = {};
    mockDappKit.state.shouldReject = false;
    mockDappKit.call.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows no role banner or badge when disconnected', () => {
    renderHeader();

    expect(screen.queryByText(/Missing SIGNALER_ROLE/)).not.toBeInTheDocument();
    expect(screen.queryByText('Signal Manager')).not.toBeInTheDocument();
  });

  it('shows a yellow banner when the connected wallet is missing the role', async () => {
    mockDappKit.state.account = '0x1234567890123456789012345678901234567890';

    renderHeader();

    expect(await screen.findByText(/Ask an admin for access/)).toBeInTheDocument();
    expect(screen.queryByText('Signal Manager')).not.toBeInTheDocument();
  });

  it('shows a green badge when the connected wallet has SIGNALER_ROLE', async () => {
    mockDappKit.state.account = '0x1234567890123456789012345678901234567890';
    mockDappKit.state.roleResults = {
      [SIGNALER_ROLE]: true,
    };

    renderHeader();

    expect(await screen.findByText('Signal Manager')).toBeInTheDocument();
    expect(screen.queryByText(/Missing SIGNALER_ROLE/)).not.toBeInTheDocument();
  });

  it('shows a green badge when the connected wallet has DEFAULT_ADMIN_ROLE', async () => {
    mockDappKit.state.account = '0x1234567890123456789012345678901234567890';
    mockDappKit.state.roleResults = {
      [DEFAULT_ADMIN_ROLE]: true,
    };

    renderHeader();

    expect(await screen.findByText('Signal Manager')).toBeInTheDocument();
    expect(screen.queryByText(/Missing SIGNALER_ROLE/)).not.toBeInTheDocument();
  });

  it('shows a fix message when the role read fails', async () => {
    mockDappKit.state.account = '0x1234567890123456789012345678901234567890';
    mockDappKit.state.shouldReject = true;

    renderHeader();

    expect(await screen.findByText(/Refresh or reconnect your wallet/)).toBeInTheDocument();
    expect(screen.queryByText('Signal Manager')).not.toBeInTheDocument();
  });
});
