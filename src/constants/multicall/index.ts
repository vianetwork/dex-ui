import { ChainId } from '../index'
import MULTICALL_ABI from './abi.json'
import { getViaUniswapV2Addresses } from '../../via/deployments/getAddresses'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: getViaUniswapV2Addresses(ChainId.MAINNET).multicall,
  [ChainId.TESTNET]: getViaUniswapV2Addresses(ChainId.TESTNET).multicall
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
