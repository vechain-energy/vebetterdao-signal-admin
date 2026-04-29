# Signal Permissions

The signal admin UI uses the VeBetterPassport contract on mainnet:

- Contract: `0x35a267671d8EDD607B2056A9a13E7ba7CF53c8b3`
- Required role: `SIGNALER_ROLE`
- Role hash: `0xa4ce4aad7fca001529f4aae69bf669c4020e0aaa65ff85dc9f7b13c20e01624a`
- Admin fallback: `DEFAULT_ADMIN_ROLE`
- Admin role hash: `0x0000000000000000000000000000000000000000000000000000000000000000`

`signalUserWithReason` and `resetUserSignalsByAppWithReason` both use `onlyRoleOrAdmin(SIGNALER_ROLE)`.
That means a wallet can signal or reset when it has `SIGNALER_ROLE` or `DEFAULT_ADMIN_ROLE`.

When a wallet is connected, the header checks `hasRole(bytes32,address)` for both roles:

- Authorized wallets show a green `Signal Manager` badge near the wallet button.
- Missing-role wallets show a yellow banner that asks the user to get access from an admin.
- Role-read failures show a yellow banner that asks the user to refresh or reconnect the wallet.
