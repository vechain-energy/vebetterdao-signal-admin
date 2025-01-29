import { useQuery } from 'urql';
import { APPS_QUERY } from '../lib/graphql';
import { App } from '../types';

const transformIpfsUrl = (url: string | null) => {
  if (!url) return null;
  return url.startsWith('ipfs://')
    ? `https://ipfs.io/ipfs/${url.slice(7)}`
    : url;
};

interface AppSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export function AppSelector({ value, onChange }: AppSelectorProps) {
  const [{ data }] = useQuery<{ apps: App[] }>({ 
    query: APPS_QUERY,
    requestPolicy: 'cache-and-network'
  });

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full rounded-md px-4 py-2.5 text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
    >
      <option value="">All Apps</option>
      {data?.apps.map((app) => (
        <option key={app.id} value={app.id}>
          {app.name}
        </option>
      ))}
    </select>
  );
}