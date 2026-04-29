import { useQuery } from 'urql';
import { APPS_QUERY } from '../lib/graphql';
import { App } from '../types';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { transformIpfsUrl } from '../lib/url';
import { useResolvedAppMetadata } from '../hooks/useResolvedAppMetadata';

const EMPTY_APPS: App[] = [];

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

  const apps = data?.apps ?? EMPTY_APPS;
  const selectedApp = apps.find(app => app.id === value);
  const appsToResolve = useMemo(() => {
    if (isOpen) {
      return apps;
    }

    return selectedApp ? [selectedApp] : EMPTY_APPS;
  }, [apps, isOpen, selectedApp]);
  const metadataByAppId = useResolvedAppMetadata(appsToResolve);
  const selectedAppMetadata = selectedApp ? metadataByAppId[selectedApp.id] : undefined;

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
          {selectedAppMetadata?.logoUrl && (
            <img
              src={transformIpfsUrl(selectedAppMetadata.logoUrl)}
              alt=""
              className="w-5 h-5 rounded-full flex-shrink-0"
            />
          )}
          <span>{selectedAppMetadata?.title || selectedApp?.name || 'All Apps'}</span>
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
            {apps.map((app) => {
              const metadata = metadataByAppId[app.id];

              return (
              <button
                key={app.id}
                onClick={() => {
                  onChange(app.id);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                {metadata?.logoUrl && (
                  <img
                    src={transformIpfsUrl(metadata.logoUrl)}
                    alt=""
                    className="w-5 h-5 rounded-full flex-shrink-0"
                  />
                )}
                <span>{metadata?.title || app.name}</span>
              </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
