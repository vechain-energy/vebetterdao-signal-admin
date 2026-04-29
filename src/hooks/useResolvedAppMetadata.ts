import { useEffect, useMemo, useState } from 'react';
import { App } from '../types';
import { ResolvedAppMetadata, resolveAppMetadata } from '../lib/appMetadata';

export function useResolvedAppMetadata(apps: App[]): Record<string, ResolvedAppMetadata> {
  const uniqueApps = useMemo(() => {
    const appMap = new Map<string, App>();
    for (const app of apps) {
      if (!appMap.has(app.id)) {
        appMap.set(app.id, app);
      }
    }

    return Array.from(appMap.values());
  }, [apps]);

  const [metadataByAppId, setMetadataByAppId] = useState<Record<string, ResolvedAppMetadata>>({});

  useEffect(() => {
    let isCancelled = false;

    async function resolveMetadata() {
      const entries = await Promise.all(
        uniqueApps.map(async (app) => [app.id, await resolveAppMetadata(app)] as const)
      );

      if (!isCancelled) {
        setMetadataByAppId(Object.fromEntries(entries));
      }
    }

    if (uniqueApps.length === 0) {
      setMetadataByAppId({});
      return;
    }

    void resolveMetadata();

    return () => {
      isCancelled = true;
    };
  }, [uniqueApps]);

  return metadataByAppId;
}
