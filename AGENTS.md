# AGENTS.md

## Purpose

This file is a repo-specific working guide for agents and contributors making changes in `dex-ui`.

It does **not** replace the existing memory bank, `.clinerules`, or `.cline/skills`. It complements them with project-specific implementation guidance that should stay easy to scan during active work.

---

## Project Context

- This repo is a Via Network DEX UI adapted from a Uniswap V2-style interface.
- The app uses React, TypeScript, Redux, styled-components, ethers, zksync-ethers, and `@web3-react` v6.
- Via-specific chain behavior and deployment metadata matter. Do not assume Ethereum-mainnet defaults.

---

## Architecture Priorities

When changing this repo, prefer these boundaries:

### 1. Keep UI components presentational

UI files should render state and invoke actions.

Avoid putting connector-specific wallet teardown, provider permission requests, or storage mutation directly inside presentational components unless there is a very strong reason.

Prefer:

- hooks for wallet/session lifecycle
- Redux actions for app state changes
- small storage helpers for persisted local state

### 2. Centralize wallet/session lifecycle logic

Wallet lifecycle behavior should live in dedicated hooks/services, not be spread across:

- `AccountDetails`
- `WalletModal`
- random page components

If a change touches connect, disconnect, eager reconnect, injected-provider syncing, or account switching, inspect these files first:

- `src/hooks/useWalletSession.ts`
- `src/hooks/index.ts`
- `src/components/Web3ReactManager/index.tsx`
- `src/components/WalletModal/index.tsx`
- `src/components/AccountDetails/index.tsx`

### 3. Treat provider state as source of truth for injected wallets

For MetaMask/injected wallets:

- app session storage is only local intent
- `eth_accounts` and `accountsChanged` are the provider truth
- disconnecting the app is not the same as changing MetaMask accounts

If the UI shows the wrong connected account, reconcile against provider state first.

---

## Wallet and Session Rules

### Disconnect vs switch-account semantics

Do not conflate these actions.

#### Disconnect

Means:

- clear app-local wallet session state
- deactivate connector session when supported
- clear persisted wallet-session metadata
- optionally clear chain-scoped transaction UI state

Does **not** mean:

- revoke MetaMask site permissions
- guarantee a different account on next connect

#### Switch Account

Means:

- ask the injected provider to expose/select accounts again
- reactivate the injected connector if the provider account changes
- reconcile app state from provider state

### Injected wallet syncing

For injected wallets, the app should stay in sync with:

- `eth_accounts`
- `accountsChanged`

Global synchronization belongs in `Web3ReactManager`-level hooks, not only button handlers.

### Persisted wallet session storage

Keep persisted wallet session data minimal and versioned.

Current pattern:

- file: `src/state/wallet/sessionStorage.ts`
- key: `wallet:session:v1`

Persist only what the app actually needs, such as:

- normalized wallet key

Do not persist:

- provider objects
- account addresses as the source of truth
- connector internals

---

## TypeScript and Typing Guidance

### Prefer typed wallet keys over raw object-key access

When iterating `SUPPORTED_WALLETS`, avoid loose `Object.keys(...)` patterns if they break key typing.

Prefer the typed key helpers exported from constants.

### Avoid `any`

If interacting with injected providers or connector capabilities, prefer:

- small local interfaces
- type guards
- narrowed helper functions

over `as any` or broad unsafe casts.

### Co-locate types unless clearly shared

Follow the existing repo guidance:

- keep types near the hook/component by default
- extract only when shared across unrelated files

---

## File Ownership Guidance

Use this as a quick routing map when deciding where a change belongs.

### Wallet/session behavior

- `src/hooks/useWalletSession.ts`
- `src/hooks/index.ts`
- `src/components/Web3ReactManager/index.tsx`

### Wallet connection UI

- `src/components/WalletModal/index.tsx`
- `src/components/WalletModal/PendingView.tsx`
- `src/components/AccountDetails/index.tsx`
- `src/components/Web3Status/index.tsx`

### Persisted wallet session data

- `src/state/wallet/sessionStorage.ts`

### Wallet metadata and typed wallet keys

- `src/constants/index.ts`

### Transaction cleanup policy

- `src/state/transactions/actions.ts`
- `src/state/transactions/hooks.tsx`

---

## Change Design Rules

### Prefer one strong session boundary over scattered fixes

If a bug appears in wallet switching or disconnect behavior, resist patching multiple components ad hoc.

First ask:

- should this be solved in `useWalletSession`?
- should this be solved in injected-provider sync?
- should this be solved in `Web3ReactManager`?

### Do not hide product semantics in implementation details

If the UX means different things, expose them differently.

Examples:

- `Disconnect` should not secretly mean `Switch Account`
- `Change Wallet` should not be relied on to reconcile injected account exposure

### Be honest about wallet limitations

MetaMask controls:

- permission prompts
- exposed accounts
- selected account for the site

The app can request and reconcile, but cannot force MetaMask to behave like a custom account picker.

---

## Verification Checklist

Before finishing wallet-related work, verify at least these:

- [ ] disconnect clears app session state
- [ ] eager reconnect respects persisted wallet-session intent
- [ ] switching accounts inside MetaMask updates the app account state
- [ ] zero exposed accounts deactivates the app session
- [ ] no connector-specific teardown is buried in presentational UI unnecessarily
- [ ] TypeScript passes for touched wallet/session files

If browser verification is available, test both:

1. app-triggered switch/disconnect
2. manual account changes inside MetaMask while the app is open

---

## When to Update This File

Update `AGENTS.md` when:

- a recurring failure mode is discovered
- a new architectural boundary is introduced
- wallet/session behavior changes materially
- the preferred implementation location for a class of changes becomes clearer

Keep it short, concrete, and repo-specific.