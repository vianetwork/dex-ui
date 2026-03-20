# Cline Workflow (dex-ui)

This document defines the expected workflow when using **Cline** in this
repository.

It complements, but does not replace:

- the global Memory Bank rules
- the repo-local `.clinerules/*` files
- `AGENTS.md`

## 1) Start by reading context

Before doing any work, read the repo guidance in this order:

- `.clinerules/code-style.md` - TypeScript, React, naming, comments, and formatting rules
- `.clinerules/implementation-docs.md` - planning and execution order guidance
- `AGENTS.md` - concise repo-specific routing and non-negotiable rules

Then read the Memory Bank:

- `memory-bank/projectbrief.md`
- `memory-bank/productContext.md`
- `memory-bank/systemPatterns.md`
- `memory-bank/techContext.md`
- `memory-bank/activeContext.md`
- `memory-bank/progress.md`

## 2) Read subsystem-specific context when relevant

Read the docs and files that match the area you are changing instead of
guessing. Do not read all of `docs/engineering/` by default.

### Architecture and file ownership

- `docs/engineering/architecture-overview.md`
- `docs/engineering/code-change-guardrails.md`

### Wallet and session lifecycle

- `docs/engineering/wallet-session-rules.md`
- `src/hooks/useWalletSession.ts`
- `src/hooks/index.ts`
- `src/components/Web3ReactManager/index.tsx`
- `src/components/WalletModal/index.tsx`
- `src/components/WalletModal/PendingView.tsx`
- `src/components/AccountDetails/index.tsx`
- `src/state/wallet/sessionStorage.ts`
- `src/constants/index.ts`

### Via deployment artifacts and chain configuration

- `docs/engineering/via-deployment-constraints.md`
- `src/via/deployments/`
- `src/constants/index.ts`
- `src/constants/multicall/`
- `src/constants/v1/`
- `src/utils/zksync.ts`

### Token lists and asset configuration

- `docs/engineering/via-deployment-constraints.md`
- `src/state/lists/hooks.ts`
- `src/constants/lists.ts`
- `src/constants/index.ts`

### Swap and liquidity flows

- `docs/engineering/code-change-guardrails.md`
- `src/hooks/useSwapCallback.ts`
- `src/hooks/useApproveCallback.ts`
- `src/hooks/useWrapCallback.ts`
- `src/pages/Swap/`
- `src/pages/AddLiquidity/`
- `src/pages/RemoveLiquidity/`
- `src/pages/Pool/`

### Shared state and app behavior

- `docs/engineering/state-management-boundaries.md`
- `src/state/`
- `src/pages/App.tsx`
- `src/pages/AppBody.tsx`
- `src/components/Header/`

## 3) Plan mode first

In Plan mode:

- write down **Goal**, **Deliverables**, and **Success Criteria**
- list repo-specific constraints before proposing changes
- ask questions when scope is ambiguous instead of guessing

Common constraints in this repo:

- wallet disconnect and switch-account semantics are different
- injected wallet state must reconcile against provider state
- Via chain configuration and deployment artifacts must stay correct
- BTC branding should stay consistent across the UI
- changes should follow existing Uniswap-style UI patterns unless there is a clear reason not to

## 4) Act mode execution

In Act mode:

- prefer small, reviewable changes
- search and read relevant code before editing
- keep changes consistent with existing patterns in `.clinerules/*` and `AGENTS.md`
- centralize wallet and session logic instead of patching multiple presentational components
- prefer artifact-driven address/config reads over hardcoded Via values when that pattern already exists
- update the Memory Bank after significant changes or when project guidance becomes clearer

## 5) Verification

Run the smallest relevant verification step for what you changed:

- `docs/engineering/verification-checklist.md`
- `yarn lint`
- `source /home/romano/.nvm/nvm.sh && nvm use 20 && yarn tsc --noEmit`
- `yarn test`
- `yarn integration-test`

If you change wallet/session behavior, verify as many of these as possible:

- disconnect clears app-local wallet session state
- eager reconnect respects persisted session intent
- provider account changes update the app account state
- zero exposed injected accounts deactivates the app session

## 6) Memory Bank maintenance

Update the Memory Bank when:

- a significant feature or refactor is completed
- a new architectural pattern or preferred file ownership becomes clear
- project workflow or verification expectations change
- the user explicitly asks to update the memory bank

When updating it, focus especially on:

- `memory-bank/activeContext.md` for current decisions and next steps
- `memory-bank/progress.md` for what changed and what remains
- `memory-bank/techContext.md` when tooling or verification commands change

If repo guidance structure changes, keep these aligned too:

- `AGENTS.md`
- `docs/engineering/`