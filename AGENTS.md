# AGENTS.md

## Purpose

This file is the repo-specific routing layer for agents and contributors working
in `dex-ui`.

It should stay short, high-signal, and easy to scan. Long-form subsystem docs
live in `docs/engineering/`.

It complements, but does not replace:

- `.clinerules/*` for workflow and authoring rules
- `memory-bank/*` for current project state
- `docs/engineering/*` for deep repo-specific onboarding

---

## Project Context

- `dex-ui` is a Via Network DEX frontend adapted from a Uniswap V2-style UI.
- Via-specific chain behavior and deployment metadata matter. Do not assume
  Ethereum-mainnet defaults.
- When in doubt, prefer existing repo boundaries over ad hoc local fixes.

---

## Non-Negotiable Rules

### 1. Keep UI components presentational

Do not bury connector teardown, provider permission requests, or persistent
wallet/session mutation inside presentational components unless there is a very
strong reason.

### 2. Centralize wallet/session lifecycle logic

If work touches connect, disconnect, eager reconnect, injected-provider sync, or
switch-account flows, start with:

- `src/hooks/useWalletSession.ts`
- `src/hooks/index.ts`
- `src/components/Web3ReactManager/index.tsx`

### 3. Treat injected provider state as source of truth

For injected wallets:

- app session storage is only local intent
- `eth_accounts` and `accountsChanged` are provider truth
- disconnect is not the same thing as switching MetaMask accounts

### 4. Prefer artifact-driven Via configuration

If router, factory, multicall, WBTC, pair bytecode hash, or explorer metadata
already come from `src/via/deployments/`, do not reintroduce hardcoded values in
feature code.

### 5. Preserve product semantics

- `Disconnect` must not secretly behave like `Switch Account`
- `Change Wallet` must not be the only mechanism that reconciles injected
  account exposure
- BTC branding should stay consistent in touched UI

---

## Engineering Playbook Docs

Read the specific docs that match your task instead of reading everything by
default.

- Architecture overview:
  - `docs/engineering/architecture-overview.md`
- Wallet/session rules:
  - `docs/engineering/wallet-session-rules.md`
- State ownership boundaries:
  - `docs/engineering/state-management-boundaries.md`
- Via deployment constraints:
  - `docs/engineering/via-deployment-constraints.md`
- Code-change guardrails:
  - `docs/engineering/code-change-guardrails.md`
- Verification checklist:
  - `docs/engineering/verification-checklist.md`

---

## Subsystem Routing

### Wallet/session lifecycle

- docs:
  - `docs/engineering/wallet-session-rules.md`
- source:
  - `src/hooks/useWalletSession.ts`
  - `src/hooks/index.ts`
  - `src/components/Web3ReactManager/index.tsx`
  - `src/components/WalletModal/index.tsx`
  - `src/components/WalletModal/PendingView.tsx`
  - `src/components/AccountDetails/index.tsx`
  - `src/state/wallet/sessionStorage.ts`

### Via deployment and chain config

- docs:
  - `docs/engineering/via-deployment-constraints.md`
- source:
  - `src/via/deployments/`
  - `src/constants/index.ts`
  - `src/constants/multicall/`
  - `src/constants/v1/`
  - `src/utils/zksync.ts`

### Shared state and app behavior

- docs:
  - `docs/engineering/state-management-boundaries.md`
- source:
  - `src/state/`
  - `src/pages/App.tsx`
  - `src/pages/AppBody.tsx`
  - `src/components/Header/`

---

## Verification

Before finishing, use `docs/engineering/verification-checklist.md` and run the
smallest relevant verification step for the area you changed.

---

## When to Update This File

Update `AGENTS.md` when:

- the routing map changes
- a new non-negotiable repo rule becomes clear
- the preferred doc location for a subsystem changes

Keep it short, concrete, and repo-specific.