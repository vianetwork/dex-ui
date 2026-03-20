# Architecture Overview

## Purpose

`dex-ui` is a Via Network DEX frontend adapted from a Uniswap V2-style
interface. It is a React single-page app that renders swap and liquidity flows,
connects wallets through `@web3-react`, and reads Via-specific deployment
metadata from checked-in artifacts.

## Major layers

### UI and routing

- `src/pages/` owns route-level behavior
- `src/components/` owns reusable presentation and interaction primitives
- `src/pages/App.tsx` and `src/pages/AppBody.tsx` coordinate the app shell

### Shared app state

- `src/state/` contains Redux slices for application, user, swap, mint, burn,
  lists, transactions, multicall, and wallet state
- hooks bridge Redux and on-chain reads into presentational UI

### Web3 and chain integration

- `src/connectors/` owns wallet connector setup
- `src/components/Web3ReactManager/` owns app-level wallet/provider syncing
- `src/hooks/` owns transaction hooks, approvals, wrapping, and wallet session
  orchestration

### Via-specific configuration

- `src/via/deployments/` owns artifact-driven chain metadata
- `src/constants/` exposes chain IDs, tokens, wallet metadata, and address access
- `src/utils/zksync.ts` owns ZK Stack-specific address and display helpers

## Preferred ownership boundaries

- UI components should stay presentational when possible
- hooks should own lifecycle and orchestration logic
- Redux should own shared app state, not connector internals
- storage helpers should persist only minimal local intent
- deployment artifacts should remain the source of truth for Via addresses and
  explorer metadata when that pattern exists

## Important entry points

- Wallet/session lifecycle:
  - `src/hooks/useWalletSession.ts`
  - `src/components/Web3ReactManager/index.tsx`
  - `src/components/WalletModal/index.tsx`
  - `src/components/AccountDetails/index.tsx`
- Swap and approvals:
  - `src/hooks/useSwapCallback.ts`
  - `src/hooks/useApproveCallback.ts`
  - `src/hooks/useWrapCallback.ts`
- Token lists and assets:
  - `src/state/lists/hooks.ts`
  - `src/constants/lists.ts`
  - `src/constants/index.ts`
- Via deployment metadata:
  - `src/via/deployments/`
  - `src/constants/multicall/`
  - `src/constants/v1/`
  - `src/utils/zksync.ts`