import { ChainId } from '../index'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x60Aa68f9D0D736B9a0a716d04323Ba3b22602840',
  [ChainId.TESTNET]: '0x60Aa68f9D0D736B9a0a716d04323Ba3b22602840'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
