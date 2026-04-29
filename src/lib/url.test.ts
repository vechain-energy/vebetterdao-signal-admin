import { describe, expect, it } from 'vitest';
import { transformIpfsUrl } from './url';

describe('transformIpfsUrl', () => {
  it('converts ipfs urls to an HTTP gateway url', () => {
    expect(transformIpfsUrl('ipfs://bafybeifoo/logo.png')).toBe(
      'https://api.gateway-proxy.vechain.org/ipfs/bafybeifoo/logo.png'
    );
  });

  it('keeps non-ipfs urls unchanged', () => {
    expect(transformIpfsUrl('https://example.com/logo.png')).toBe(
      'https://example.com/logo.png'
    );
  });
});
