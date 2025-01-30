import { useQuery } from 'urql';
import { APPS_QUERY } from '../lib/graphql';
import { App } from '../types';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const transformIpfsUrl = (url: string): string => {
  return url.startsWith('ipfs://')
    ? `https://ipfs.io/ipfs/${url.slice(7)}`
    : url;
};

interface AppSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export function AppSelector({ value, onChange }: AppSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [{ data }] = useQuery<{ apps: App[] }>({ 
    query: APPS_QUERY,
    requestPolicy: 'cache-and-network'
  });

  const selectedApp = data?.apps?.find(app => app.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-md py-2.5 pl-4 pr-10 text-left text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
      >
        <div className="flex items-center gap-2">
          {selectedApp?.metadata?.logoUrl && (
            <img
              src={transformIpfsUrl(selectedApp.metadata.logoUrl)}
              alt=""
              className="w-5 h-5 rounded-full flex-shrink-0"
            />
          )}
          <span>{selectedApp?.name || 'All Apps'}</span>
        </div>
      </button>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <ChevronDown className="h-4 w-4" />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200">
          <div className="py-1 max-h-60 overflow-auto">
            <button
              key="all"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              All Apps
            </button>
            {data?.apps.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  onChange(app.id);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                {app.metadata?.logoUrl && (
                  <img
                    src={transformIpfsUrl(app.metadata.logoUrl)}
                    alt=""
                    className="w-5 h-5 rounded-full flex-shrink-0"
                  />
                )}
                <span>{app.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}