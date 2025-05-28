import { Currency, CurrencyAmount, Pair, Token, TokenAmount, Trade } from '@uniswap/sdk'
import flatMap from 'lodash.flatmap'
import { useMemo } from 'react'

import { BASES_TO_CHECK_TRADES_AGAINST, ChainId, CUSTOM_BASES, WBTC } from '../constants'
import { PairState, usePairs } from '../data/Reserves'
import { wrappedCurrency } from '../utils/wrappedCurrency'

import { useActiveWeb3React } from './index'
import { getZksyncPairAddress } from '../utils/zksync'

function useAllCommonPairs(currencyA?: Currency, currencyB?: Currency): Pair[] {
  const { chainId } = useActiveWeb3React()

  const bases: Token[] = chainId ? BASES_TO_CHECK_TRADES_AGAINST[chainId] : []

  const [tokenA, tokenB] = chainId
    ? [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
    : [undefined, undefined]

  const basePairs: [Token, Token][] = useMemo(
    () =>
      flatMap(bases, (base): [Token, Token][] => bases.map(otherBase => [base, otherBase])).filter(
        ([t0, t1]) => t0.address !== t1.address
      ),
    [bases]
  )

  const allPairCombinations: [Token, Token][] = useMemo(
    () =>
      tokenA && tokenB
        ? [
          // the direct pair
          [tokenA, tokenB],
          // token A against all bases
          ...bases.map((base): [Token, Token] => [tokenA, base]),
          // token B against all bases
          ...bases.map((base): [Token, Token] => [tokenB, base]),
          // each base against all bases
          ...basePairs
        ]
          .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
          .filter(([t0, t1]) => t0.address !== t1.address)
          .filter(([tokenA, tokenB]) => {
            if (!chainId) return true
            const customBases = CUSTOM_BASES[chainId]
            if (!customBases) return true

            const customBasesA: Token[] | undefined = customBases[tokenA.address]
            const customBasesB: Token[] | undefined = customBases[tokenB.address]

            if (!customBasesA && !customBasesB) return true

            if (customBasesA && !customBasesA.find(base => tokenB.equals(base))) return false
            if (customBasesB && !customBasesB.find(base => tokenA.equals(base))) return false

            return true
          })
        : [],
    [tokenA, tokenB, bases, basePairs, chainId]
  )

  const allPairs = usePairs(allPairCombinations)

  // only pass along valid pairs, non-duplicated pairs
  return useMemo(
    () =>
      Object.values(
        allPairs
          // filter out invalid pairs
          .filter((result): result is [PairState.EXISTS, Pair] => Boolean(result[0] === PairState.EXISTS && result[1]))
          // filter out duplicated pairs
          .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
            const add = getZksyncPairAddress(curr.chainId as any, curr.token0.address, curr.token1.address);
            memo[add] = memo[add] ?? curr
            return memo
          }, {})
      ),
    [allPairs]
  )
}

function classToObject(instance: any): Record<string, any> {
  const obj: Record<string, any> = {};

  // Copy instance fields
  for (const key of Object.keys(instance)) {
    obj[key] = instance[key];
  }

  // Copy prototype methods
  const proto = Object.getPrototypeOf(instance);
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== 'constructor' && typeof proto[key] === 'function') {
      obj[key] = proto[key].bind(instance);
    }
  }

  return obj;
}

export function useTradeExactIn(currencyAmountIn?: CurrencyAmount, currencyOut?: Currency): any | null {
  const allowedPairs = useAllCommonPairs(currencyAmountIn?.currency, currencyOut)
  return useMemo(() => {
    const oldCurrencyAmountIn = currencyAmountIn;
    const oldCurrencyOut = currencyOut;
    if ((currencyAmountIn && oldCurrencyAmountIn) && currencyOut && oldCurrencyOut && allowedPairs.length > 0) {
      if (currencyAmountIn.currency.symbol == "ETH" || currencyAmountIn.currency.symbol == "BTC") {
        currencyAmountIn = new TokenAmount(WBTC[ChainId.TESTNET], currencyAmountIn.raw);
      }
      if (currencyOut.symbol == "ETH" || currencyOut.symbol == "BTC") {
        currencyOut = WBTC[ChainId.TESTNET];
      }
      const original = Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: 3, maxNumResults: 1 })[0] ?? null;
      const obj = classToObject(original)
      if (oldCurrencyAmountIn.currency.symbol == "ETH" || oldCurrencyAmountIn.currency.symbol == "BTC") {
        obj.inputAmount.currency = oldCurrencyAmountIn.currency;
        obj.inputAmount.token = oldCurrencyAmountIn.currency;
      }
      return obj
    }
    return null
  }, [allowedPairs, currencyAmountIn, currencyOut])
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(currencyIn?: Currency, currencyAmountOut?: CurrencyAmount): any | null {
  const allowedPairs = useAllCommonPairs(currencyIn, currencyAmountOut?.currency)

  return useMemo(() => {
    // const oldCurrencyAmountOut = currencyAmountOut;
    // const oldCurrencyIn = currencyIn;
    // if (currencyIn && oldCurrencyIn && currencyAmountOut && oldCurrencyAmountOut && allowedPairs.length > 0) {
    //   if (currencyAmountOut.currency.symbol == "ETH" || currencyAmountOut.currency.symbol == "BTC") {
    //     currencyAmountOut = new TokenAmount(WBTC[ChainId.TESTNET], currencyAmountOut.raw);
    //   }
    //   if (currencyIn.symbol == "ETH" || currencyIn.symbol == "BTC") {
    //     currencyIn = WBTC[ChainId.TESTNET];
    //   }

    //   const original = Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, { maxHops: 3, maxNumResults: 1 })[0] ??
    //     null;
    //   const obj = classToObject(original)
    //   if (oldCurrencyIn.symbol == "ETH" || oldCurrencyIn.symbol == "BTC") {
    //     obj.inputAmount.currency = oldCurrencyIn;
    //     obj.outputAmount.token = oldCurrencyIn;
    //   }
    //   return obj
    // }
    return null
  }, [allowedPairs, currencyIn, currencyAmountOut])
}
