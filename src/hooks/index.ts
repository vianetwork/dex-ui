import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { injected } from '../connectors'
import { ChainId, NetworkContextName } from '../constants'
import { clearWalletSession, loadWalletSession } from '../state/wallet/sessionStorage'

interface RequestArguments {
  method: string
}

interface InjectedEthereumProvider {
  on?: (eventName: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (eventName: string, handler: (...args: unknown[]) => void) => void
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

export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> & { chainId?: ChainId } {
  const context = useWeb3ReactCore<Web3Provider>()
  const contextNetwork = useWeb3ReactCore<Web3Provider>(NetworkContextName)
  return context.active ? context : contextNetwork
}

export function useEagerConnect() {
  const { activate, active } = useWeb3ReactCore() // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false)

  useEffect(() => {
    const persistedWalletSession = loadWalletSession()
    const shouldReconnectInjected =
      persistedWalletSession?.walletKey === 'INJECTED' || persistedWalletSession?.walletKey === 'METAMASK'

    if (!shouldReconnectInjected) {
      setTried(true)
      return
    }

    injected.isAuthorized().then(isAuthorized => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      }
    })
  }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate, deactivate } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does

  useEffect(() => {
    const { ethereum } = window

    if (ethereum && ethereum.on && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch(error => {
          console.error('Failed to activate after chain changed', error)
        })
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          clearWalletSession()
          if (deactivate) deactivate()
          return
        }

        // eat errors
        activate(injected, undefined, true).catch(error => {
          console.error('Failed to activate after accounts changed', error)
        })
      }

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
    return undefined
  }, [error, suppress, activate, deactivate, active])
}

export function useInjectedAccountSync(suppress = false) {
  const { account, active, activate, deactivate, error } = useWeb3ReactCore()

  useEffect(() => {
    const provider = getInjectedProvider()
    const persistedWalletSession = loadWalletSession()
    const shouldTrackInjected =
      persistedWalletSession?.walletKey === 'INJECTED' || persistedWalletSession?.walletKey === 'METAMASK'

    if (!provider || !shouldTrackInjected || error || suppress) return undefined

    const syncAccounts = async () => {
      try {
        const accounts = await provider.request({ method: 'eth_accounts' })
        if (!Array.isArray(accounts)) return

        const exposedAccounts = accounts.filter((value): value is string => typeof value === 'string')
        if (exposedAccounts.length === 0) {
          clearWalletSession()
          if (deactivate) deactivate()
          return
        }

        if (!active || exposedAccounts[0] !== account) {
          await activate(injected, undefined, true)
        }
      } catch (syncError) {
        console.error('Failed to sync injected accounts:', syncError)
      }
    }

    void syncAccounts()

    const handleAccountsChanged = () => {
      void syncAccounts()
    }

    provider.on?.('accountsChanged', handleAccountsChanged)

    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged)
    }
  }, [account, active, activate, deactivate, error, suppress])
}
