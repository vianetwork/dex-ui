import type { SupportedWalletKey } from '../../constants'

const WALLET_SESSION_STORAGE_KEY = 'wallet:session:v1'

export interface PersistedWalletSession {
  walletKey: SupportedWalletKey
}

export function loadWalletSession(): PersistedWalletSession | null {
  try {
    const storedSession = window.localStorage.getItem(WALLET_SESSION_STORAGE_KEY)
    if (!storedSession) return null

    const parsedSession = JSON.parse(storedSession) as Partial<PersistedWalletSession>
    if (!parsedSession.walletKey) return null

    return { walletKey: parsedSession.walletKey }
  } catch {
    return null
  }
}

export function saveWalletSession(session: PersistedWalletSession): void {
  try {
    window.localStorage.setItem(WALLET_SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    return
  }
}

export function clearWalletSession(): void {
  try {
    window.localStorage.removeItem(WALLET_SESSION_STORAGE_KEY)
  } catch {
    return
  }
}