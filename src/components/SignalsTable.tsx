import { useState, useCallback } from 'react';
import { useQuery } from 'urql';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Signal } from '../types';
import { SIGNALS_QUERY } from '../lib/graphql';
import { useNameLookup } from '../hooks/useNameLookup';
import { useConnex } from '@vechain/dapp-kit-react';
import { Modal } from './Modal';
import clsx from 'clsx';

const columnHelper = createColumnHelper<Signal>();

const transformIpfsUrl = (url: string | null) => {
  if (!url) return null;
  return url.startsWith('ipfs://')
    ? `https://ipfs.io/ipfs/${url.slice(7)}`
    : url;
};

function UserCell({ userId, userName }: { userId: string; userName: string | null }) {
  const { names, loading } = useNameLookup([userId]);
  const resolvedName = names[userId.toLowerCase()];
  const displayName = userName || resolvedName;
  
  if (loading) {
    return <span className="text-gray-400">Loading...</span>;
  }
  
  return (
    <div className="flex flex-col">
      <a
        href={`https://vechainstats.com/account/${userId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-500 hover:text-orange-600"
        title={displayName || userId}
      >
        {displayName ? displayName : `${userId.slice(0, 6)}...${userId.slice(-4)}`}
      </a>
      {displayName && (
        <span className="text-xs text-gray-500">
          {userId.slice(0, 6)}...{userId.slice(-4)}
        </span>
      )}
    </div>
  );
}

interface SignalsTableProps {
  selectedApp?: string;
  selectedUser?: string;
}

export function SignalsTable({ selectedApp, selectedUser }: SignalsTableProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const pageSize = 10;
  const connex = useConnex();

  const CONTRACT_ADDRESS = '0x35a267671d8EDD607B2056A9a13E7ba7CF53c8b3';

  const RESET_ABI = {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "resetUserSignalsWithReason",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  };

  const handleRemoveClick = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  }, []);

  const handleRemoveConfirm = useCallback(async (reason: string) => {
    if (!selectedUserId) return;

    setIsRemoving(selectedUserId);
    try {
      const method = connex.thor
        .account(CONTRACT_ADDRESS)
        .method(RESET_ABI);

      const clause = method.asClause(selectedUserId, reason);
      
      try {
        await connex.thor.explain([clause]).execute();
      } catch (error) {
        console.error('Simulation failed:', error);
        alert('This transaction would fail. Please check if you have the necessary permissions.');
        return;
      }
      
      const tx = await connex.vendor
        .sign('tx', [clause])
        .comment('Reset user signals')
        .request();

      console.log('Transaction sent:', tx);
    } catch (error) {
      console.error('Error sending transaction:', error);
      alert('Failed to send transaction. Please try again.');
    } finally {
      setIsRemoving(null);
      setIsModalOpen(false);
      setSelectedUserId(null);
    }
  }, [connex, selectedUserId]);

  const where: Record<string, any> = {};
  if (selectedApp) where.app = selectedApp;
  if (selectedUser) where.user = selectedUser;

  const [{ data, fetching, error }] = useQuery({
    query: SIGNALS_QUERY,
    variables: {
      first: pageSize,
      skip: pageIndex * pageSize,
      where: Object.keys(where).length > 0 ? where : undefined,
    },
    requestPolicy: 'cache-and-network',
  });

  const signals = data?.userSignals ?? [];
  const hasMore = signals.length === pageSize;

  const columns = [
    columnHelper.accessor('app.name', {
      header: 'App',
      cell: (info) => (
        <div className="flex items-center gap-2 max-w-[200px]">
          {info.row.original.app.metadata?.logoUrl && (
            <img
              src={transformIpfsUrl(info.row.original.app.metadata.logoUrl)}
              alt={info.getValue()}
              className="w-6 h-6 rounded-full flex-shrink-0"
            />
          )}
          <span className="truncate" title={info.getValue()}>
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('user.name', {
      header: 'User',
      cell: (info) => (
        <UserCell 
          userId={info.row.original.user.id} 
          userName={info.getValue()}
        />
      ),
    }),
    columnHelper.accessor('signalCount', {
      header: 'Signal Count',
    }),
    columnHelper.accessor('timestamp', {
      header: 'Date',
      cell: (info) => format(new Date(parseInt(info.getValue()) * 1000), 'yyyy-MM-dd HH:mm:ss'),
    }),
    columnHelper.accessor('transaction.id', {
      header: 'Transaction',
      cell: (info) => (
        <a
          href={`https://vechainstats.com/transaction/${info.getValue()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-500 hover:text-orange-600"
        >
          {`${info.getValue().slice(0, 6)}...${info.getValue().slice(-4)}`}
        </a>
      ),
    }),
    columnHelper.accessor('user.id', {
      header: '',
      cell: (info) => (
        <div className="flex justify-end">
          <button
            onClick={() => handleRemoveClick(info.getValue())}
            disabled={isRemoving === info.getValue()}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove signals"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: signals,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: hasMore ? -1 : pageIndex + 1,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  });

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error: {error.message}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow w-full">
        <div className="min-w-[800px] overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[20%]" />
              <col className="w-[10%]" />
              <col className="w-[25%]" />
              <col className="w-[20%]" />
              <col className="w-[5%]" />
            </colgroup>
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fetching ? (
                Array.from({ length: pageSize }).map((_, index) => (
                  <tr key={index} className="h-[72px]">
                    {Array.from({ length: 6 }).map((_, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                        <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : signals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-[720px] px-6 py-4 text-center text-gray-500 bg-white">
                    No signals found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="h-[72px]">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <button
            onClick={() => setPageIndex((old) => Math.max(0, old - 1))}
            disabled={pageIndex === 0}
            className={clsx(
              'p-2 rounded-md',
              pageIndex === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm text-gray-700">
            <span>Page {pageIndex + 1}</span>
          </div>
          <button
            onClick={() => setPageIndex((old) => old + 1)}
            disabled={!hasMore || fetching}
            className={clsx(
              'p-2 rounded-md',
              !hasMore || fetching
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUserId(null);
        }}
        onConfirm={handleRemoveConfirm}
        title="Remove Signals"
      />
    </>
  );
}