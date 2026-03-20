# Product Context: Via DEX UI

## Why This Project Exists

Via Network is a Bitcoin Layer 2 solution that brings smart contract capabilities to Bitcoin through ZK rollup technology. While the core infrastructure (via-core) handles the blockchain layer, users need an intuitive interface to interact with DeFi protocols on this network.

The Via DEX UI exists to:
1. **Bridge the UX gap** - Provide a familiar Uniswap-like experience for users coming from Ethereum DeFi
2. **Enable DeFi on Bitcoin L2** - Allow users to swap tokens and provide liquidity on Via Network
3. **Maintain Bitcoin identity** - Display BTC branding instead of ETH to reflect the Bitcoin-native nature of Via

## Problems It Solves

### For End Users
- **Token Swapping**: Exchange tokens on Via Network without needing to understand the underlying ZK technology
- **Liquidity Provision**: Earn fees by providing liquidity to trading pairs
- **Portfolio Management**: Track liquidity positions and pool shares
- **Wallet Management**: Connect, disconnect, and switch accounts with clear semantics

### For the Via Ecosystem
- **Adoption Driver**: A working DEX is essential for any L2 ecosystem
- **Liquidity Bootstrap**: Enables initial liquidity for the network
- **Developer Showcase**: Demonstrates that standard DeFi primitives work on Via

## How It Should Work

### User Flows

#### Token Swap
1. User connects wallet (MetaMask, WalletConnect, etc.)
2. Selects input token and amount
3. Selects output token
4. Reviews price impact and slippage
5. Confirms transaction
6. Receives swapped tokens

#### Add Liquidity
1. User connects wallet
2. Selects token pair
3. Enters amounts (auto-calculates ratio)
4. Approves tokens if needed
5. Confirms liquidity addition
6. Receives LP tokens

#### Remove Liquidity
1. User views their positions
2. Selects position to remove
3. Chooses percentage to remove
4. Confirms transaction
5. Receives underlying tokens

## User Experience Goals

### Primary UX Principles
1. **Familiarity**: Users familiar with Uniswap should feel at home
2. **Clarity**: Clear display of prices, slippage, and fees
3. **Bitcoin-Native Feel**: BTC branding throughout (not ETH)
4. **Error Prevention**: Clear warnings for high slippage or price impact

### Visual Identity
- Bitcoin-themed branding (BTC logo, Bitcoin color scheme)
- Via Network branding elements
- Clean, modern interface inherited from Uniswap V2

### Accessibility
- Multi-language support (11 languages)
- Responsive design for mobile and desktop
- Clear error messages and transaction status

## Target Audience

### Primary Users
- **DeFi Veterans**: Users experienced with Uniswap/DEXes on other chains
- **Bitcoin Enthusiasts**: Users interested in Bitcoin L2 DeFi
- **Liquidity Providers**: Users seeking yield opportunities

### Secondary Users
- **Developers**: Testing token integrations on Via testnet
- **Projects**: Teams launching tokens on Via Network
