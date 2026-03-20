/**
 * Via Deployment Address Loader
 *
 * Provides synchronous access to deployed contract addresses and the
 * pair bytecode hash for a given Via chain ID.
 *
 * Addresses are loaded from checked-in JSON artifacts:
 *   - via.deployments.testnet.json  (chainId 25223)
 *   - via.deployments.mainnet.json  (chainId 5223)
 *
 * These JSON files contain PLACEHOLDER values (0x000...0) until the
 * via-contracts deployment scripts produce real addresses. After
 * deploying, copy the output into the corresponding JSON file.
 */

import { ViaDeploymentArtifact } from './types'

// Checked-in deployment artifacts (loaded synchronously at build time)
import testnet from './via.deployments.testnet.json'
import mainnet from './via.deployments.mainnet.json'

/** Map of chainId → deployment artifact for fast lookup */
const byChainId: { [chainId: number]: ViaDeploymentArtifact } = {
  [testnet.chainId]: testnet as any,
  [mainnet.chainId]: mainnet as any
}

/**
 * Get the full deployment artifact for a Via chain.
 * Throws if the chainId is not recognized.
 */
export function getViaDeployments(chainId: number): ViaDeploymentArtifact {
  const artifact = byChainId[chainId]
  if (!artifact) {
    throw new Error(`Missing Via deployments for chainId=${chainId}`)
  }
  if (artifact.chainId !== chainId) {
    throw new Error(
      `Deployments chainId mismatch: expected ${chainId} got ${artifact.chainId}`
    )
  }
  return artifact
}

/**
 * Get the V2 contract addresses and pair bytecode hash for a Via chain.
 * This is the primary API used by constants and utilities throughout the UI.
 */
export function getViaUniswapV2Addresses(chainId: number) {
  const d = getViaDeployments(chainId).contracts.v2
  return {
    router02: d.router02,
    factory: d.factory,
    wbtc: d.wbtc,
    multicall: d.multicall,
    pairBytecodeHash: d.pairBytecodeHash
  }
}
