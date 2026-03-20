# Progress: Via DEX UI

## ✅ Latest Update (March 2026)

### Wallet session lifecycle centralized

Implemented centralized wallet session management based on implementation plans
in `private_docs/`:

- Created `src/hooks/useWalletSession.ts` with `connect()`, `disconnect()`,
  and `switchInjectedAccount()` operations
- Created `src/state/wallet/sessionStorage.ts` for versioned localStorage
  persistence of wallet session intent
- Updated `Web3ReactManager` for eager reconnect from persisted session
- Updated `WalletModal` to use `useWalletSession.connect()` with rollback on
  failure via `clearWalletSession()`
- Updated `AccountDetails` to use presentational disconnect/switch buttons
  that delegate to `useWalletSession`
- Updated `PendingView` to stay presentational

### Engineering documentation suite

- Created `docs/engineering/` with 7 subsystem playbooks (architecture,
  wallet-session rules, state management, Via deployment constraints,
  code-change guardrails, verification checklist)
- Refocused `AGENTS.md` as concise routing layer pointing to engineering docs
- Added `.clinerules/CLINE-WORKFLOW.md` for standardized Cline workflow

### Agent skills installed

- Added Vercel composition patterns, React best practices, React Native skills,
  and web design guidelines as installable agent skills (commit `c285ae4`)

---

## What Works

### Wallet Session Lifecycle ✅ (New)
- **Centralized disconnect**: Full teardown through `useWalletSession.disconnect()`
- **Switch account**: MetaMask account picker via `wallet_requestPermissions`
- **Eager reconnect**: `Web3ReactManager` reads persisted session on mount
- **Session persistence**: Versioned localStorage via `sessionStorage.ts`
- **Optimistic connect**: Session saved before activation; rolled back on failure

### Artifact-Driven Address Resolution ✅
- Via deployment artifacts drive router/factory/multicall/WBTC/pair bytecode
  hash lookups through `src/via/deployments/getAddresses.ts`
- Explorer links are chain-aware (Via testnet uses Blockscout)
- TypeScript compiles cleanly: `nvm use 20 && yarn tsc --noEmit` passes

### UI Code ✅
- **Token Swapping**: Swap interface complete
- **Add Liquidity**: Add liquidity UI complete
- **Remove Liquidity**: Remove liquidity UI complete
- **Pool Discovery**: PoolFinder page complete
- **Wallet Connection**: MetaMask and other wallets connect properly

### Via Network Integration ✅
- **Chain Configuration**: Custom chain IDs (5223/25223) configured
- **ZK Stack Compatibility**: Pair address calculation using zksync-ethers
- **Contract Addresses**: Testnet deployment artifact populated with live
  addresses
- **WBTC Integration**: Wrapped Bitcoin as base token
- **vUSDC-Y**: Built-in testnet token support with pinned USDC/vUSDC-Y pair

### Branding ✅
- **BTC Display**: ETH to BTC symbol casting throughout UI
- **Bitcoin Logo**: Bitcoin branding assets added
- **Via Branding**: Updated favicon and index.html

### Repo Guidance ✅
- **AGENTS.md**: Concise routing layer with non-negotiable rules
- **docs/engineering/**: 7 subsystem playbooks
- **.clinerules/**: Code style, implementation docs, Cline workflow
- **memory-bank/**: Project state documentation

## What's Left to Build

### Testing & QA
- [ ] Validate swap/add/remove liquidity against live testnet contracts
- [ ] Verify wallet session lifecycle end-to-end:
  - [ ] Disconnect clears app-local wallet session state
  - [ ] Eager reconnect respects persisted session intent
  - [ ] Provider account changes update the app account state
  - [ ] Zero exposed injected accounts deactivates the app session
- [ ] Edge case testing (high slippage, low liquidity)
- [ ] Mobile responsiveness testing
- [ ] Cross-browser testing

### Mainnet Preparation
- [ ] Mainnet contract deployment and addresses
- [ ] Mainnet RPC configuration
- [ ] Production environment variables
- [ ] Security audit of frontend

### Token List
- [ ] Curated token list for Via Network
- [ ] Token logo assets
- [ ] Token list hosting/distribution

### Documentation
- [ ] User documentation
- [ ] Developer documentation
- [ ] Deployment guide

### Nice-to-Have Features
- [ ] Analytics dashboard
- [ ] Price charts
- [ ] Transaction history
- [ ] Advanced trading features

## Current Status

### Overall Progress
```
[████████████████████░░░░░░░░░░] 70%
```

### Component Status
| Component | Status | Notes |
|-----------|--------|-------|
| Swap Page | ✅ Working | Core functionality complete |
| Pool Page | ✅ Working | Shows user positions |
| Add Liquidity | ✅ Working | Fixed in recent commits |
| Remove Liquidity | ✅ Working | Functional |
| Pool Finder | ✅ Working | Can discover pools |
| Header/Navigation | ✅ Working | Via branding applied |
| Wallet Modal | ✅ Working | Uses useWalletSession for connect |
| Account Details | ✅ Working | Presentational disconnect/switch |
| Web3ReactManager | ✅ Working | Eager reconnect from session |
| Session Storage | ✅ Working | Versioned localStorage |
| Settings | ✅ Working | Slippage, deadline config |
| Token Selection | ✅ Working | Search and select tokens |
| Engineering Docs | ✅ Complete | 7 subsystem playbooks |
| Agent Skills | ✅ Installed | 4 Vercel skills |

### Branch Status
- **feat/via-univ2**: Active development branch
- **Latest commit**: `c285ae4` (add skills)
- **main**: Not yet merged (pending testing)

## Known Issues

### Potential Issues to Monitor
1. **SDK Compatibility**: ChainId casting to `any` is a workaround
2. **Token List**: Need official Via Network token list
3. **Mainnet Addresses**: Not yet configured
4. **Deployment Metadata**: `deployedAt`, `gitCommit`, `compiler.solc`, and
   `compiler.zksolc` are still blank in the checked-in testnet artifact
5. **Wallet session edge cases**: Need to verify behavior when MetaMask is
   locked, when user rejects permission request, when WalletConnect session
   expires

## Evolution of Project Decisions

### Phase 1: Initial Fork
- Started as Uniswap V2 interface fork
- Ethereum-focused with ETH branding

### Phase 2: Via Network Adaptation
1. Chain Configuration: Added Via chain IDs
2. ZK Stack Integration: Added zksync-ethers for pair calculation
3. Branding: ETH to BTC throughout
4. Contract Addresses: Via-specific addresses

### Phase 3: Artifact-Driven Architecture
1. Deployment artifacts as source of truth for addresses
2. Chain-aware explorer links
3. Typed schema for deployment metadata

### Phase 4: Wallet Session Centralization (Current)
1. `useWalletSession` hook as single entry point
2. Versioned localStorage for session persistence
3. Clear disconnect vs switch-account semantics
4. Presentational UI components delegating to hooks

### Future: Mainnet & Production
- Mainnet deployment
- Additional features (analytics, charts)
- Performance optimizations

## Milestones

### Completed ✅
- [x] Fork Uniswap V2 interface
- [x] Configure Via Network chain IDs
- [x] Integrate zksync-ethers
- [x] Update contract addresses
- [x] Implement BTC branding
- [x] Fix liquidity functionality
- [x] Clean up codebase
- [x] Artifact-driven address wiring
- [x] Populate testnet deployment artifact with live addresses
- [x] Add vUSDC-Y token support
- [x] Centralize wallet session lifecycle
- [x] Create engineering documentation suite
- [x] Add Cline workflow guidance
- [x] Install agent skills

### In Progress 🔄
- [ ] Testnet testing against live deployed contracts
- [ ] Wallet session lifecycle end-to-end verification

### Upcoming 📋
- [ ] Mainnet configuration
- [ ] Production deployment
- [ ] Token list finalization
- [ ] User/developer documentation

## Recent Activity Log

| Date | Activity | Commit |
|------|----------|--------|
| 2026 | Add agent skills | `c285ae4` |
| 2025 | Add vUSDC-Y token | `45693eb` |
| 2025 | Docs and agents | `37e8fa0` |
| 2025 | Add .clinerules | `34d2089` |
| 2025 | Add AGENTS.md | `868e128` |
| 2025 | Artifact-driven wiring | `92788fc` |
| May 28, 2025 | Asset cleanup | `73f1c81` |
| May 28, 2025 | Index/favicon update | `57f61d2` |
| May 28, 2025 | Branding + BTC casting | `76334d6` |
| May 28, 2025 | Console log cleanup | `2646517` |
| May 28, 2025 | Package.json update | `3f0ea1f` |
| May 28, 2025 | Add liquidity fix | `5abfd1b` |
| May 28, 2025 | Chain ID updates | `2b9604f` |
| May 28, 2025 | Major Via integration | `0663e4d` |
