export const VEBETTER_PASSPORT_ADDRESS = '0x35a267671d8EDD607B2056A9a13E7ba7CF53c8b3';
export const SIGNALER_ROLE =
  '0xa4ce4aad7fca001529f4aae69bf669c4020e0aaa65ff85dc9f7b13c20e01624a';
export const DEFAULT_ADMIN_ROLE =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

const HAS_ROLE_ABI = {
  inputs: [
    {
      internalType: 'bytes32',
      name: 'role',
      type: 'bytes32',
    },
    {
      internalType: 'address',
      name: 'account',
      type: 'address',
    },
  ],
  name: 'hasRole',
  outputs: [
    {
      internalType: 'bool',
      name: 'hasRole',
      type: 'bool',
    },
  ],
  stateMutability: 'view',
  type: 'function',
};

export interface SignalAuthorization {
  hasDefaultAdminRole: boolean;
  hasSignalerRole: boolean;
  isAuthorized: boolean;
}

type DecodedRoleOutput = Record<string | number, unknown>;

export function decodeHasRole(decoded: DecodedRoleOutput): boolean {
  const decodedValue = decoded.hasRole ?? decoded[0] ?? decoded['0'];

  if (typeof decodedValue !== 'boolean') {
    throw new Error('Unable to decode role status. You need to refresh or reconnect.');
  }

  return decodedValue;
}

async function readHasRole(
  connex: { thor: Connex.Thor },
  role: string,
  account: string
): Promise<boolean> {
  const { decoded } = await connex.thor
    .account(VEBETTER_PASSPORT_ADDRESS)
    .method(HAS_ROLE_ABI)
    .call(role, account);

  return decodeHasRole(decoded);
}

export async function readSignalAuthorization(
  connex: { thor: Connex.Thor },
  account: string
): Promise<SignalAuthorization> {
  const [hasSignalerRole, hasDefaultAdminRole] = await Promise.all([
    readHasRole(connex, SIGNALER_ROLE, account),
    readHasRole(connex, DEFAULT_ADMIN_ROLE, account),
  ]);

  return {
    hasDefaultAdminRole,
    hasSignalerRole,
    isAuthorized: hasSignalerRole || hasDefaultAdminRole,
  };
}
