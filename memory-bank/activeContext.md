# Active Context: Via DEX UI

## Current Work Focus

### ✅ Latest: Wallet session lifecycle centralized

Implemented a centralized wallet session management system following the
disconnect and switch-account implementation plans in `private_docs/`.

**New files created:**
- `src/hooks/useWalletSession.ts` - Central hook for all wallet session
  lifecycle operations (connect, disconnect, switchInjectedAccount)
- `src/state/wallet/sessionStorage.ts` - Versioned localStorage helper for
  persisting wallet session intent

**Key semantics implemented:**
- **Disconnect** clears app-local session state, tears down WalletConnect
  provider if applicable, calls `close()` on connectors that support it,
  deactivates web3-react, and clears pending transactions
- **Switch Account** (injected only) uses `wallet_requestPermissions` +
  `eth_requestAccounts` to prompt MetaMask account picker, then re-activates
  the injected connector
- **Eager reconnect** in `Web3ReactManager` respects persisted session intent
  from localStorage
- **Provider account changes** (`accountsChanged` event) update the app account
  state
- **Zero exposed accounts** deactivates the app session

**Design principles:**
- `connect()` is optimistic - persists session before activation succeeds;
  `WalletModal.tryActivation` rolls back on failure via `clearWalletSession()`
- UI components (`AccountDetails`, `WalletModal`, `PendingView`) are
  presentational - they call hooks, not connector internals
- Injected provider state is source of truth; localStorage is only local intent

### ✅ Engineering documentation suite created

Added `docs/engineering/` as the long-form home for repo onboarding and
subsystem playbooks:
- `architecture-overview.md` - App structure and ownership boundaries
- `wallet-session-rules.md` - Wallet lifecycle semantics and rules
- `state-management-boundaries.md` - Redux slice ownership
- `via-deployment-constraints.md` - Artifact-driven config rules
- `code-change-guardrails.md` - What to check before changing code
- `verification-checklist.md` - How to verify changes

Refocused `AGENTS.md` into a concise routing layer that points to these docs.

### ✅ Cline workflow guidance added

- `.clinerules/CLINE-WORKFLOW.md` standardizes how Cline reads context,
  plans, executes, and verifies in this repo
- Routes subsystem work through `AGENTS.md` and `docs/engineering/`

### ✅ Skills added

- Installed Vercel composition patterns, React best practices, React Native
  skills, and web design guidelines as agent skills (commit `c285ae4`)

### ✅ Via testnet deployment artifact populated

- `src/via/deployments/via.deployments.testnet.json` contains live contract
  addresses (factory, router, multicall, WBTC, pair bytecode hash)
- Built-in token support for `vUSDC-Y` on testnet

### ✅ Artifact-driven address wiring

- All router/factory/multicall/WBTC/pair-bytecode-hash lookups go through
  `src/via/deployments/getAddresses.ts`
- Explorer links are chain-aware (Via testnet uses Blockscout)

## Next Steps

1. **Testing**: Validate swap/add/remove liquidity flows against the live Via
   testnet deployment with the new wallet session lifecycle
2. **Eager reconnect verification**: Confirm that page reload correctly
   reconnects to the previously connected wallet
3. **Provider event handling**: Verify `accountsChanged` and `chainChanged`
   events work correctly with the centralized session logic
4. **Mainnet Preparation**: Update configuration for mainnet deployment when
   contracts are available
5. **Token List**: Finalize token list for Via Network

## Active Decisions and Considerations

### Wallet Session Architecture
- **Decision**: Centralize all wallet lifecycle in `useWalletSession` hook
- **Rationale**: Prevents scattered connector teardown in UI components;
  single source of truth for session state
- **Key rule**: Disconnect is NOT the same as switch-account; they have
  different semantics and different code paths

### Injected Provider as Source of Truth
- **Decision**: `eth_accounts` and `accountsChanged` are provider truth;
  localStorage is only local intent
- **Rationale**: MetaMask can change accounts independently of the app;
  the app must reconcile against provider state

### Branding Decision
- **Decision**: Display "BTC" instead of "ETH" throughout the UI
- **Implementation**: `tryCastSymbolToBTC()` and `tryCastNameToBTC()` in
  `src/utils/zksync.ts`

### Chain ID Strategy
- **Decision**: Use custom ChainId enum (5223/25223) instead of SDK's
- **Implementation**: Override in `src/constants/index.ts`

### ZK Stack Compatibility
- **Decision**: Use zksync-ethers for pair address calculation
- **Implementation**: `getZksyncPairAddress()` in `src/utils/zksync.ts`

## Important Patterns and Preferences

### Wallet Session Lifecycle Ownership
| File | Responsibility |
|------|---------------|
| `useWalletSession.ts` | connect, disconnect, switchInjectedAccount |
| `sessionStorage.ts` | Versioned localStorage read/write/clear |
| `Web3ReactManager` | Eager reconnect on mount |
| `WalletModal` | Connector activation UI + rollback on failure |
| `AccountDetails` | Presentational disconnect/switch buttons |

### Code Style
- TypeScript strict mode
- Functional components with hooks
- Redux for state management
- Styled-components for styling
- See `.clinerules/code-style.md` for full guidelines

### Repo Guidance Stack
1. `.clinerules/code-style.md` - Authoring rules
2. `.clinerules/implementation-docs.md` - Planning and execution order
3. `AGENTS.md` - Concise routing and non-negotiable rules
4. `docs/engineering/*` - Deep subsystem onboarding
5. `memory-bank/*` - Current project state

## Learnings and Project Insights

### Key Insight: Disconnect vs Switch Account
These are fundamentally different operations:
- **Disconnect**: Full teardown - clear session, deactivate connector, clear
  transactions. User intent is "I'm done with this wallet."
- **Switch Account**: Keep the same connector type, prompt for a different
  account. User intent is "I want to use a different account."
MetaMask's `accountsChanged` event fires for both, so the app must
distinguish based on whether the user initiated a disconnect.

### Key Insight: Optimistic Session Persistence
`connect()` saves the wallet key to localStorage before activation succeeds.
This is intentional - it allows eager reconnect on page reload. If activation
fails, the caller (`WalletModal.tryActivation`) clears the session.

### Key Insight: SDK Compatibility
The Uniswap SDK expects Ethereum chain IDs. Workaround: cast `ChainId` to
`any` when creating Token instances.

### Key Insight: ZK Stack Differences
Via Network uses `create2Address` from zksync-ethers for pair address
calculation. Standard Uniswap pair address calculation won't work.

## Current Branch
- **Branch**: `feat/via-univ2`
- **Latest Commit**: `c285ae4` (add skills)
- **Status**: Active development

## Environment
- **Network**: Via Testnet
- **Chain ID**: 25223
- **RPC**: `https://via.testnet.viablockchain.dev`
