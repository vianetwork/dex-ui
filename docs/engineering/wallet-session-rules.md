# Wallet and Session Rules

## Core principle

Wallet lifecycle behavior should be centralized in hooks and app-level wallet
managers, not scattered across presentational UI.

## Source of truth

For injected wallets, provider state is the source of truth.

- `eth_accounts` reflects exposed accounts
- `accountsChanged` reflects provider-side account changes
- persisted app state is only local intent, not the canonical account source

If the UI shows the wrong injected account, reconcile against provider state
before patching UI state directly.

## Disconnect vs switch account

These actions have different semantics and must not be conflated.

### Disconnect

Disconnect means:

- clear app-local wallet session state
- deactivate connector session when supported
- clear persisted wallet-session metadata
- optionally clear chain-scoped transaction UI state when appropriate

Disconnect does not mean:

- revoke MetaMask site permissions
- force a different account on the next connection

### Switch account

Switch account means:

- ask the injected provider to expose or re-select accounts
- reactivate the injected connector if the provider account changes
- reconcile app state from provider state changes

## Persisted session storage

Keep persisted wallet session storage minimal and versioned.

Current pattern:

- file: `src/state/wallet/sessionStorage.ts`
- key: `wallet:session:v1`

Persist only what the app needs to restore local intent, such as a normalized
wallet key.

Do not persist:

- provider objects
- account addresses as the source of truth
- connector internals

## Preferred implementation files

- `src/hooks/useWalletSession.ts`
- `src/hooks/index.ts`
- `src/components/Web3ReactManager/index.tsx`
- `src/components/WalletModal/index.tsx`
- `src/components/WalletModal/PendingView.tsx`
- `src/components/AccountDetails/index.tsx`
- `src/state/wallet/sessionStorage.ts`
- `src/constants/index.ts`