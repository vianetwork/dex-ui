import { JSBI, Percent, Token } from '@uniswap/sdk'
import { AbstractConnector } from '@web3-react/abstract-connector'

import { fortmatic, injected, portis, walletconnect, walletlink } from '../connectors'
import { getViaUniswapV2Addresses } from '../via/deployments/getAddresses'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

// Define our custom ChainId enum to replace the SDK one
export enum ChainId {
  MAINNET = 5223,
  TESTNET = 25223
}

export function getRouterAddress(chainId: ChainId): string {
  return getViaUniswapV2Addresses(chainId).router02
}

export const USDT = new Token(ChainId.TESTNET as any, '0x65C899B5fb8Eb9ae4da51D67E1fc417c7CB7e964', 6, 'USDT', 'Tether USD')
export const USDC = new Token(ChainId.TESTNET as any, '0x0a67078A35745947A37A552174aFe724D8180c25', 6, 'USDC', 'USDC')

export const WBTC = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET as any,
    getViaUniswapV2Addresses(ChainId.MAINNET).wbtc,
    18,
    'WBTC',
    'Wrapped Bitcoin'
  ),
  [ChainId.TESTNET]: new Token(
    ChainId.TESTNET as any,
    getViaUniswapV2Addresses(ChainId.TESTNET).wbtc,
    18,
    'WBTC',
    'Wrapped Bitcoin'
  ),
  '1': new Token(
    ChainId.TESTNET as any,
    getViaUniswapV2Addresses(ChainId.TESTNET).wbtc,
    18,
    'WBTC',
    'Wrapped Bitcoin'
  )
}

const WBTC_ONLY: ChainTokenList = {
  [ChainId.MAINNET]: [WBTC[ChainId.MAINNET]],
  [ChainId.TESTNET]: [WBTC[ChainId.TESTNET]]
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WBTC_ONLY,
  [ChainId.MAINNET]: [...WBTC_ONLY[ChainId.MAINNET], USDT]
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {}
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WBTC_ONLY,
  [ChainId.MAINNET]: [...WBTC_ONLY[ChainId.MAINNET], USDT]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WBTC_ONLY,
  [ChainId.MAINNET]: [...WBTC_ONLY[ChainId.MAINNET], USDT, USDC]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.TESTNET]: [
    [USDC, USDT],
  ]
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5'
  },
  COINBASE_LINK: {
    name: 'Open in Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Open in Coinbase Wallet app.',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    color: '#315CF5',
    mobile: true,
    mobileOnly: true
  },
  FORTMATIC: {
    connector: fortmatic,
    name: 'Fortmatic',
    iconName: 'fortmaticIcon.png',
    description: 'Login using Fortmatic hosted wallet',
    href: null,
    color: '#6748FF',
    mobile: true
  },
  Portis: {
    connector: portis,
    name: 'Portis',
    iconName: 'portisIcon.png',
    description: 'Login using Portis hosted wallet',
    href: null,
    color: '#4A6C9B',
    mobile: true
  }
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000))
