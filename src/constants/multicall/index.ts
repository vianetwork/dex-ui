import { ChainId } from '../index'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x094499Df5ee555fFc33aF07862e43c90E6FEe501',
  [ChainId.TESTNET]: '0x094499Df5ee555fFc33aF07862e43c90E6FEe501'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
