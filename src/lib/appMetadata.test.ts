import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveAppMetadata } from './appMetadata';
import { App } from '../types';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('resolveAppMetadata', () => {
  it('loads missing app metadata from the app metadataURI', async () => {
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response(
          JSON.stringify({
            title: 'ST3PR',
            logo: 'logo.png',
          }),
          { status: 200 }
        )
    );

    const app: App = {
      id: '0xapp',
      name: 'ST3PR',
      metadataURI: 'ipfs://bafyapp/metadata.json',
      metadata: null,
    };

    await expect(resolveAppMetadata(app)).resolves.toMatchObject({
      title: 'ST3PR',
      logoUrl: 'https://api.gateway-proxy.vechain.org/ipfs/bafyapp/logo.png',
    });
  });

  it('keeps indexed logo metadata when present', async () => {
    const app: App = {
      id: '0xapp-indexed',
      name: 'Indexed App',
      metadataURI: 'ipfs://bafyindexed/metadata.json',
      metadata: {
        logoUrl: 'ipfs://bafyindexed/logo.png',
      },
    };

    await expect(resolveAppMetadata(app)).resolves.toMatchObject({
      title: 'Indexed App',
      logoUrl: 'ipfs://bafyindexed/logo.png',
    });
  });
});
