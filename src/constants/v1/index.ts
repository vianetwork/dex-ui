import { Interface } from '@ethersproject/abi'
import { ChainId } from '../index'
import V1_EXCHANGE_ABI from './v1_exchange.json'
import V1_FACTORY_ABI from './v1_factory.json'
import { getViaUniswapV2Addresses } from '../../via/deployments/getAddresses'

const V1_FACTORY_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: getViaUniswapV2Addresses(ChainId.MAINNET).factory,
  [ChainId.TESTNET]: getViaUniswapV2Addresses(ChainId.TESTNET).factory
}

const V1_FACTORY_INTERFACE = new Interface(V1_FACTORY_ABI)
const V1_EXCHANGE_INTERFACE = new Interface(V1_EXCHANGE_ABI)

export { V1_FACTORY_ADDRESSES, V1_FACTORY_INTERFACE, V1_FACTORY_ABI, V1_EXCHANGE_INTERFACE, V1_EXCHANGE_ABI }
