import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useConnex } from '@vechain/dapp-kit-react';

const CONTRACT_ADDRESS = '0x35a267671d8EDD607B2056A9a13E7ba7CF53c8b3';

const SIGNAL_ABI = {
  "inputs": [
    {
      "internalType": "address",
      "name": "_user",
      "type": "address"
    },
    {
      "internalType": "string",
      "name": "reason",
      "type": "string"
    }
  ],
  "name": "signalUserWithReason",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
};

interface AdminActionsProps {
  onAddSignals: (addresses: string[]) => void;
}

export function AdminActions({ onAddSignals }: AdminActionsProps) {
  const [addresses, setAddresses] = useState('');
  const [signalReason, setSignalReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const connex = useConnex();

  const handleAddSignals = async () => {
    if (!signalReason) {
      alert('Please provide a reason for signaling');
      return;
    }

    const addressList = addresses
      .split('\n')
      .map((addr) => addr.trim())
      .filter(Boolean);

    if (addressList.length === 0) {
      alert('Please enter at least one address');
      return;
    }

    setIsLoading(true);
    try {
      const method = connex.thor
        .account(CONTRACT_ADDRESS)
        .method(SIGNAL_ABI);

      // Create a clause for each address
      const clauses = addressList.map(address => method.asClause(address, signalReason));
      
      // Simulate all clauses
      try {
        await connex.thor.explain(clauses).execute();
      } catch (error) {
        console.error('Simulation failed:', error);
        alert('This transaction would fail. Please check if you have the necessary permissions.');
        return;
      }
      
      const tx = await connex.vendor
        .sign('tx', clauses)
        .comment('Signal users')
        .request();

      console.log('Transaction sent:', tx);
      setAddresses('');
      setSignalReason('');
      onAddSignals(addressList);
    } catch (error) {
      console.error('Error sending transaction:', error);
      alert('Failed to send transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add Signals</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Addresses (one per line)
          </label>
          <textarea
            value={addresses}
            onChange={(e) => setAddresses(e.target.value)}
            placeholder="0x..."
            className="block w-full rounded-md px-4 py-2.5 text-gray-900 bg-white border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason
          </label>
          <input
            type="text"
            value={signalReason}
            onChange={(e) => setSignalReason(e.target.value)}
            placeholder="Enter reason for signaling"
            className="block w-full rounded-md px-4 py-2.5 text-gray-900 bg-white border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          />
        </div>
        <button
          onClick={handleAddSignals}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          {isLoading ? 'Processing...' : 'Add Signals'}
        </button>
      </div>
    </div>
  );
}