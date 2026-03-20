# System Patterns: Via DEX UI

## System Architecture

### High-Level Overview
```
┌─────────────────────────────────────────────────────────────┐
│                      Via DEX UI                              │
│                   (React Application)                        │
├─────────────────────────────────────────────────────────────┤
│  Pages          │  Components      │  State Management       │
│  - Swap         │  - Header        │  - Redux Store          │
│  - Pool         │  - CurrencyInput │  - Application State    │
│  - AddLiquidity │  - Modal         │  - User Preferences     │
│  - RemoveLiq.   │  - WalletModal   │  - Transaction State    │
│  - PoolFinder   │  - AccountDetail │  - Multicall State      │
│                 │  - Settings      │  - Wallet Session       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Web3 Layer                                │
│  - web3-react (wallet connection)                           │
│  - useWalletSession (session lifecycle)                     │
│  - sessionStorage (localStorage persistence)                │
│  - zksync-ethers (ZK Stack integration)                     │
│  - ethers.js (contract interactions)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Via Network (L2)                            │
│  Addresses from src/via/deployments/ artifacts              │
│  - Router: artifact-driven                                  │
│  - Factory: artifact-driven                                 │
│  - Multicall: artifact-driven                               │
│  - WBTC: artifact-driven                                    │
│  - Pair bytecode hash: artifact-driven                      │
└─────────────────────────────────────────────────────────────┘
```

### Four Major Layers
1. **UI/routing**: `src/pages/`, `src/components/`, `App.tsx`/`AppBody.tsx`
2. **Shared state**: Redux slices in `src/state/` for swap, mint, burn, lists,
   transactions, multicall, wallet, user
3. **Web3/chain integration**: `src/connectors/`, `Web3ReactManager`,
   `useWalletSession`, hooks for transactions/approvals/wrapping
4. **Via-specific config**: `src/via/deployments/` artifacts,
   `src/constants/`, `src/utils/zksync.ts`

## Key Technical Decisions

### 1. ZK Stack Integration
- Uses `zksync-ethers` library for compatibility with Via's ZK rollup
- Custom `create2Address` calculation for pair addresses
- Specific bytecode hash for Uniswap V2 pair creation

### 2. Bitcoin L2 Adaptations
- ETH to BTC symbol casting via `tryCastSymbolToBTC()` and
  `tryCastNameToBTC()`
- WBTC as the wrapped native token (instead of WETH)
- Bitcoin-themed branding and assets

### 3. Chain Configuration
```typescript
enum ChainId {
  MAINNET = 5223,
  TESTNET = 25223
}
```

### 4. Artifact-Driven Address Resolution
- All contract addresses come from `src/via/deployments/` JSON artifacts
- `getAddresses.ts` provides typed accessors
- No hardcoded addresses in feature code

### 5. Centralized Wallet Session Lifecycle
- All connect/disconnect/switch logic lives in `useWalletSession` hook
- UI components are presentational - they call hooks, not connector internals
- Injected provider state is source of truth; localStorage is local intent only

## Design Patterns in Use

### State Management Pattern
- **Redux** for global state management
- Organized into slices:
  - `application/` - UI state, modals, popups
  - `user/` - User preferences, settings
  - `swap/` - Swap form state
  - `mint/` - Add liquidity state
  - `burn/` - Remove liquidity state
  - `lists/` - Token lists
  - `transactions/` - Pending/confirmed transactions
  - `multicall/` - Batched contract calls
  - `wallet/` - Wallet balances and session storage

### Wallet Session Pattern
```
Connect Flow:
  WalletModal.tryActivation()
    -> useWalletSession.connect(walletKey)  // saves to localStorage
    -> connector.activate()                  // web3-react activation
    -> on failure: clearWalletSession()      // rollback

Disconnect Flow:
  AccountDetails "Disconnect" button
    -> useWalletSession.disconnect()
    -> WalletConnect: provider.disconnect()
    -> connector.close() if supported
    -> web3-react deactivate()
    -> clearWalletSession()
    -> clearAllTransactions(chainId)

Switch Account Flow (injected only):
  AccountDetails "Change" button
    -> useWalletSession.switchInjectedAccount()
    -> wallet_requestPermissions + eth_requestAccounts
    -> re-activate injected connector
    -> saveWalletSession('injected')

Eager Reconnect Flow:
  Web3ReactManager on mount
    -> loadWalletSession() from localStorage
    -> if session exists: activate corresponding connector
```

### Hook Pattern
- Custom React hooks for reusable logic:
  - `useWalletSession` - Wallet session lifecycle (connect, disconnect, switch)
  - `useSwapCallback` - Execute swap transactions
  - `useApproveCallback` - Token approvals
  - `useContract` - Contract instance creation
  - `useTrades` - Trade route calculation
  - `useWrapCallback` - Wrap/unwrap native token
  - `useActiveWeb3React` - Active web3 context
  - `useEagerConnect` - Eager connection on mount

### Component Patterns
- **Presentational UI**: Components delegate lifecycle operations to hooks
- **Compound Components**: Modal system with nested components
- **Render Props**: Currency selection modals
- **Container/Presenter**: Pages contain logic, components handle display

## Component Relationships

### Page Structure
```
App.tsx
├── Header (navigation, wallet connection)
├── Web3ReactManager (eager reconnect, provider events)
├── Routes
│   ├── /swap -> Swap Page
│   ├── /pool -> Pool Page
│   ├── /add/:currencyA/:currencyB -> AddLiquidity Page
│   ├── /remove/:currencyA/:currencyB -> RemoveLiquidity Page
│   └── /find -> PoolFinder Page
└── Popups (transaction notifications)
```

### Wallet Session Ownership
```
useWalletSession.ts          -- lifecycle operations
  ├── sessionStorage.ts      -- localStorage read/write/clear
  ├── Web3ReactManager       -- eager reconnect on mount
  ├── WalletModal            -- connector activation UI + rollback
  ├── AccountDetails         -- presentational disconnect/switch
  └── PendingView            -- presentational pending state
```

### Data Flow
```
User Action -> Hook -> Contract Call -> Transaction
                 ↓
             Redux State Update
                 ↓
             UI Re-render
```

## Critical Implementation Paths

### Swap Execution Path
1. `useSwapCallback` prepares transaction
2. Router contract `swapExactTokensForTokens` or similar
3. Transaction submitted to Via Network
4. Transaction state tracked in Redux
5. UI updates on confirmation

### Pair Address Calculation (ZK-specific)
```typescript
// src/utils/zksync.ts
const getZksyncPairAddress = (chainId, token0, token1) => {
  const salt = keccak256(solidityPack(["address", "address"], [token0, token1]));
  const hash = arrayify(UNISWAP_V2_PAIR_CREATION_CODE_HASH);
  return create2Address(V1_FACTORY_ADDRESSES[chainId], hash, salt, []);
}
```

### Token Symbol Display
```typescript
// src/utils/zksync.ts
export const tryCastSymbolToBTC = (symbol: string) => {
  if (symbol == "ETH") return "BTC";
  return symbol;
}
```

### Wallet Session Persistence
```typescript
// src/state/wallet/sessionStorage.ts
// Versioned localStorage key: "via-dex:wallet-session:v1"
// Stores: { walletKey: string } (e.g., "injected", "walletconnect")
// Read on mount by Web3ReactManager for eager reconnect
// Written optimistically by useWalletSession.connect()
// Cleared by useWalletSession.disconnect() and on activation failure
```

## File Organization

```
src/
├── assets/          # Images, SVGs
├── components/      # Reusable UI components
│   ├── AccountDetails/  # Wallet account display + disconnect/switch
│   ├── WalletModal/     # Wallet connection UI + pending view
│   └── Web3ReactManager/ # Eager reconnect + provider event handling
├── connectors/      # Wallet connectors (injected, walletconnect, etc.)
├── constants/       # Chain config, addresses, ABIs
├── data/            # Data fetching utilities
├── hooks/           # Custom React hooks
│   ├── useWalletSession.ts  # Central wallet session lifecycle
│   └── index.ts             # useActiveWeb3React, useEagerConnect, etc.
├── pages/           # Route pages
├── state/           # Redux store and slices
│   └── wallet/
│       └── sessionStorage.ts  # Versioned localStorage helper
├── theme/           # Styled-components theme
├── utils/           # Helper functions (zksync.ts, etc.)
└── via/
    └── deployments/ # Deployment artifacts and typed accessors
```

## Integration Points

### External Dependencies
- **@uniswap/sdk**: Core swap logic and types
- **zksync-ethers**: ZK Stack compatibility
- **web3-react**: Wallet connection abstraction
- **ethers**: Ethereum library

### Contract Interfaces
- Uniswap V2 Router ABI
- Uniswap V2 Factory ABI
- Uniswap V2 Pair ABI
- ERC20 ABI
- Multicall ABI

## Smart Contract Dependencies

### Contracts Deployed on Via Testnet

Addresses are read from `src/via/deployments/via.deployments.testnet.json`:

| Contract | Purpose |
|----------|---------|
| **Multicall** | Batch read calls |
| **UniswapV2Router02** | Execute swaps |
| **UniswapV2Factory** | Create pairs |
| **WBTC** | Wrapped native token |

### Address Update Flow

After deploying contracts to a new network:
1. Create/update the deployment artifact JSON in `src/via/deployments/`
2. The UI reads addresses through `getAddresses.ts` - no code changes needed
3. Update `.env` for the new network RPC URL and chain ID

## Engineering Documentation

Detailed subsystem docs live in `docs/engineering/`:
- `architecture-overview.md` - App structure and ownership boundaries
- `wallet-session-rules.md` - Wallet lifecycle semantics
- `state-management-boundaries.md` - Redux slice ownership
- `via-deployment-constraints.md` - Artifact-driven config rules
- `code-change-guardrails.md` - Pre-change checklist
- `verification-checklist.md` - Post-change verification
