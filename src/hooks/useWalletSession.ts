import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useWeb3React } from '@web3-react/core'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

import type { SupportedWalletKey } from '../constants'
import { ChainId } from '../constants'
import { injected } from '../connectors'
import { useActiveWeb3React } from './index'
import { clearAllTransactions } from '../state/transactions/actions'
import { clearWalletSession, loadWalletSession, saveWalletSession } from '../state/wallet/sessionStorage'

interface ConnectorWithClose {
  close?: () => Promise<void> | void
}

interface RequestArguments {
  method: string
  params?: unknown[]
}

interface InjectedEthereumProvider {
  isMetaMask?: boolean
  request: (args: RequestArguments) => Promise<unknown>
}

function isInjectedEthereumProvider(value: unknown): value is InjectedEthereumProvider {
  if (!value || typeof value !== 'object') return false

  const maybeProvider = value as { request?: unknown }
  return typeof maybeProvider.request === 'function'
}

function getInjectedProvider(): InjectedEthereumProvider | null {
  const ethereum = (window as typeof window & { ethereum?: unknown }).ethereum
  if (!isInjectedEthereumProvider(ethereum)) return null
  return ethereum
}

export interface WalletSessionResult {
  connectedWalletKey?: SupportedWalletKey
  connect: (walletKey: SupportedWalletKey) => void
  disconnect: () => Promise<void>
  switchInjectedAccount: () => Promise<void>
  canSwitchAccount: boolean
}

/**
 * Centralizes wallet session persistence and connector teardown so UI components stay presentational.
 */
export function useWalletSession(): WalletSessionResult {
  const dispatch = useDispatch()
  const { activate, connector, deactivate } = useWeb3React()
  const { chainId } = useActiveWeb3React()
  const canSwitchAccount = connector === injected

  const connect = useCallback((walletKey: SupportedWalletKey) => {
    saveWalletSession({ walletKey })
  }, [])

  const disconnect = useCallback(async () => {
    if (connector instanceof WalletConnectConnector) {
      if (connector.walletConnectProvider?.disconnect) {
        await connector.walletConnectProvider.disconnect()
      }

      connector.walletConnectProvider = undefined
    }

    const connectorWithClose = connector as ConnectorWithClose | undefined
    if (connectorWithClose?.close) {
      await connectorWithClose.close()
    }

    if (deactivate) {
      deactivate()
    }

    clearWalletSession()

    if (chainId) {
      dispatch(clearAllTransactions({ chainId: chainId as ChainId }))
    }
  }, [chainId, connector, deactivate, dispatch])

  const switchInjectedAccount = useCallback(async () => {
    const provider = getInjectedProvider()
    if (!provider) return

    await provider.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] })
    await provider.request({ method: 'eth_requestAccounts' })
    await activate(injected, undefined, true)

    saveWalletSession({ walletKey: provider.isMetaMask ? 'METAMASK' : 'INJECTED' })
  }, [activate])

  return {
    canSwitchAccount,
    connectedWalletKey: loadWalletSession()?.walletKey,
    connect,
    disconnect,
    switchInjectedAccount
  }
}