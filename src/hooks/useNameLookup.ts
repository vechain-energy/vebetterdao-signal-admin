import { useConnex } from '@vechain/dapp-kit-react';
import { useCallback, useEffect, useState } from 'react';

const CONTRACT_ADDRESS = '0xA11413086e163e41901bb81fdc5617c975Fa5a1A';

const NAME_LOOKUP_ABI = {
  inputs: [
    {
      internalType: "address[]",
      name: "addresses",
      type: "address[]",
    },
  ],
  name: "getNames",
  outputs: [
    {
      internalType: "string[]",
      name: "names",
      type: "string[]",
    },
  ],
  stateMutability: "view",
  type: "function",
};

export function useNameLookup(addresses: string[]) {
  const connex = useConnex();
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupNames = useCallback(async (addrs: string[]) => {
    if (!connex || addrs.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { decoded } = await connex.thor
        .account(CONTRACT_ADDRESS)
        .method(NAME_LOOKUP_ABI)
        .call([addrs]);
      
      const nameMap: Record<string, string> = {};
      addrs.forEach((addr, i) => {
        nameMap[addr.toLowerCase()] = decoded.names[i];
      });
      
      setNames(nameMap);
    } catch (err) {
      console.error('Error looking up names:', err);
      setError(err instanceof Error ? err.message : 'Failed to lookup names');
    } finally {
      setLoading(false);
    }
  }, [connex]);

  useEffect(() => {
    const uniqueAddresses = [...new Set(addresses.map(addr => addr.toLowerCase()))];
    lookupNames(uniqueAddresses);
  }, [addresses, lookupNames]);

  return { names, loading, error };
}