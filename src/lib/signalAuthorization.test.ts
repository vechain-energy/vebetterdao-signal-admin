import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_ADMIN_ROLE,
  SIGNALER_ROLE,
  decodeHasRole,
  readSignalAuthorization,
} from './signalAuthorization';

function createConnex(roleResults: Record<string, boolean>) {
  const call = vi.fn(async (role: string) => ({
    decoded: {
      hasRole: roleResults[role] ?? false,
    },
  }));

  const connex = {
    thor: {
      account: vi.fn(() => ({
        method: vi.fn(() => ({
          call,
        })),
      })),
    },
  } as unknown as { thor: Connex.Thor };

  return { call, connex };
}

describe('decodeHasRole', () => {
  it('reads named Connex decoded output', () => {
    expect(decodeHasRole({ hasRole: true })).toBe(true);
  });

  it('reads positional Connex decoded output', () => {
    expect(decodeHasRole({ 0: true })).toBe(true);
  });
});

describe('readSignalAuthorization', () => {
  it('authorizes a signaler wallet', async () => {
    const { connex } = createConnex({
      [SIGNALER_ROLE]: true,
      [DEFAULT_ADMIN_ROLE]: false,
    });

    await expect(readSignalAuthorization(connex, '0x1234567890123456789012345678901234567890')).resolves.toMatchObject({
      hasDefaultAdminRole: false,
      hasSignalerRole: true,
      isAuthorized: true,
    });
  });

  it('authorizes a default admin wallet', async () => {
    const { connex } = createConnex({
      [SIGNALER_ROLE]: false,
      [DEFAULT_ADMIN_ROLE]: true,
    });

    await expect(readSignalAuthorization(connex, '0x1234567890123456789012345678901234567890')).resolves.toMatchObject({
      hasDefaultAdminRole: true,
      hasSignalerRole: false,
      isAuthorized: true,
    });
  });

  it('rejects a wallet without signaler or admin role', async () => {
    const { connex } = createConnex({
      [SIGNALER_ROLE]: false,
      [DEFAULT_ADMIN_ROLE]: false,
    });

    await expect(readSignalAuthorization(connex, '0x1234567890123456789012345678901234567890')).resolves.toMatchObject({
      hasDefaultAdminRole: false,
      hasSignalerRole: false,
      isAuthorized: false,
    });
  });
});
