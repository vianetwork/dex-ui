# Project Brief: Via DEX UI

## Overview
Via DEX UI is a decentralized exchange (DEX) user interface built for the Via Network - a Bitcoin Layer 2 solution. The project is based on Uniswap V2's interface, adapted specifically for the Via Network's unique characteristics as a Bitcoin-based ZK rollup.

## Core Requirements

### Primary Goals
1. Provide a user-friendly interface for token swapping on Via Network
2. Enable liquidity provision and management
3. Support the Via Network's native BTC-based ecosystem
4. Integrate with ZK Stack infrastructure

### Technical Requirements
- React-based single-page application
- Web3 wallet integration (MetaMask, WalletConnect, Coinbase Wallet, etc.)
- Support for Via Network chain IDs:
  - Mainnet: 5223
  - Testnet: 25223
- Integration with zksync-ethers for ZK Stack compatibility
- ETH → BTC symbol/name casting throughout the UI (since Via is a Bitcoin L2)

### Target Users
- DeFi users looking to swap tokens on Via Network
- Liquidity providers wanting to earn fees
- Developers testing on Via testnet

## Project Scope

### In Scope
- Token swap functionality
- Liquidity pool management (add/remove liquidity)
- Pool discovery and position tracking
- Multi-wallet support
- Multi-language support (i18n)

### Out of Scope
- Backend services (uses on-chain contracts directly)
- Smart contract development (contracts in separate repo - see Dependencies)
- Block explorer functionality

### Dependencies (External)
- **Smart Contracts**: DEX contracts must be deployed separately
  - Fork from: https://github.com/Uniswap/v2-core and https://github.com/Uniswap/v2-periphery
  - Compile with zksolc for ZK Stack compatibility
  - See `systemPatterns.md` for required contracts and addresses

## Success Metrics
- Successful token swaps on Via Network
- Liquidity provision working correctly
- Proper display of BTC branding instead of ETH
- Responsive and accessible UI

## Repository Information
- **Repository**: git@github.com:vianetwork/dex-ui.git
- **Branch**: feat/via-univ2
- **Based on**: Uniswap V2 Interface
