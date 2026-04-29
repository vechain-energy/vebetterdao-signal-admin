import { LayoutGrid, ShieldCheck } from 'lucide-react';
import { WalletButton, useWallet } from '@vechain/dapp-kit-react';
import { useSignalAuthorization } from '../hooks/useSignalAuthorization';

type SignalRoleState = 'idle' | 'authorized' | 'missing' | 'error';

interface HeaderContentProps {
  roleState: SignalRoleState;
}

export function HeaderContent({ roleState }: HeaderContentProps) {
  const showMissingRoleBanner = roleState === 'missing';
  const showReadErrorBanner = roleState === 'error';

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <LayoutGrid className="h-8 w-8 text-orange-500" />
            <h1 className="ml-3 text-xl font-semibold text-gray-900 sm:text-2xl">
              VeBetterDAO Signal Admin
            </h1>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {roleState === 'authorized' && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                <ShieldCheck className="h-4 w-4" />
                Signal Manager
              </div>
            )}
            <WalletButton />
          </div>
        </div>
      </div>

      {(showMissingRoleBanner || showReadErrorBanner) && (
        <div className="border-t border-yellow-200 bg-yellow-50">
          <div className="max-w-7xl mx-auto px-4 py-2 text-sm font-medium text-yellow-800 sm:px-6 lg:px-8">
            {showMissingRoleBanner
              ? 'This wallet cannot manage signals yet. Ask an admin for access, then refresh.'
              : 'We could not check this wallet yet. Refresh or reconnect your wallet.'}
          </div>
        </div>
      )}
    </header>
  );
}

export function Header() {
  const { account } = useWallet();
  const signalAuthorization = useSignalAuthorization(account);

  let roleState: SignalRoleState = 'idle';
  if (account && signalAuthorization.isError) {
    roleState = 'error';
  } else if (account && signalAuthorization.data?.isAuthorized) {
    roleState = 'authorized';
  } else if (account && signalAuthorization.data && !signalAuthorization.data.isAuthorized) {
    roleState = 'missing';
  }

  return <HeaderContent roleState={roleState} />;
}
