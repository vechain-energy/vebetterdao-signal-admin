import { useState } from 'react';
import { Provider } from 'urql';
import { useWallet } from '@vechain/dapp-kit-react';
import { client } from './lib/graphql';
import { SignalsTable } from './components/SignalsTable';
import { AppSelector } from './components/AppSelector';
import { AdminActions } from './components/AdminActions';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import clsx from 'clsx';

type TabType = 'signals' | 'resets';

function AdminInterface() {
  const { account } = useWallet();
  const [selectedApp, setSelectedApp] = useState<string>();
  const [selectedUser, setSelectedUser] = useState<string>();
  const [activeTab, setActiveTab] = useState<TabType>('signals');

  const handleAddSignals = async (addresses: string[]) => {
    console.log('Adding signals for addresses:', addresses);
    // To be implemented with dapp-kit
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="space-y-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by App
                </label>
                <AppSelector value={selectedApp} onChange={setSelectedApp} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by User Address
                </label>
                <input
                  type="text"
                  value={selectedUser || ''}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  placeholder="0x..."
                  className="block w-full rounded-md px-4 py-2.5 text-gray-900 bg-white border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('signals')}
                  className={clsx(
                    'w-32 py-4 px-1 text-center border-b-2 text-sm font-medium',
                    activeTab === 'signals'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  Signals
                </button>
                <button
                  onClick={() => setActiveTab('resets')}
                  className={clsx(
                    'w-32 py-4 px-1 text-center border-b-2 text-sm font-medium',
                    activeTab === 'resets'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  Resets
                </button>
              </nav>
            </div>

            {activeTab === 'signals' ? (
              <SignalsTable
                selectedApp={selectedApp}
                selectedUser={selectedUser}
              />
            ) : (
              <SignalsTable
                selectedApp={selectedApp}
                selectedUser={selectedUser}
                type="resets"
              />
            )}
          </div>

          {account && (
            <AdminActions
              onAddSignals={handleAddSignals}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Provider value={client}>
      <AdminInterface />
    </Provider>
  );
}
