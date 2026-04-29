import { useQuery } from '@tanstack/react-query';
import { useConnex } from '@vechain/dapp-kit-react';
import { readSignalAuthorization } from '../lib/signalAuthorization';

export function useSignalAuthorization(account: string | null | undefined) {
  const connex = useConnex();
  const normalizedAccount = account?.toLowerCase() ?? null;

  return useQuery({
    queryKey: ['signal-authorization', normalizedAccount],
    queryFn: () => {
      if (!account) {
        throw new Error('Wallet missing. You need to connect a wallet.');
      }

      return readSignalAuthorization(connex, account);
    },
    enabled: Boolean(account),
    retry: false,
    staleTime: 30_000,
  });
}
