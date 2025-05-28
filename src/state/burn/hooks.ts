import { Currency, CurrencyAmount, JSBI, Pair, Percent, TokenAmount } from '@uniswap/sdk'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { usePair } from '../../data/Reserves'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveWeb3React } from '../../hooks'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { AppDispatch, AppState } from '../index'
import { tryParseAmount } from '../swap/hooks'
import { useTokenBalances } from '../wallet/hooks'
import { Field, typeInput } from './actions'
import { toV2LiquidityToken } from '../user/hooks'

export function useBurnState(): AppState['burn'] {
  return useSelector<AppState, AppState['burn']>(state => state.burn)
}

export function useDerivedBurnInfo(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined
): {
  pair?: Pair | null
  parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.CURRENCY_A]?: CurrencyAmount
    [Field.CURRENCY_B]?: CurrencyAmount
  }
  error?: string
} {
  const { account, chainId } = useActiveWeb3React()

  const { independentField, typedValue } = useBurnState()

  // pair + totalsupply
  const [, pair] = usePair(currencyA, currencyB)
  const liquidityToken = toV2LiquidityToken(pair?.token0.chainId as any, [pair?.token0!, pair?.token1!])

  // balances
  const relevantTokenBalances = useTokenBalances(account ?? undefined, [liquidityToken])
  const userLiquidity: undefined | TokenAmount = relevantTokenBalances?.[liquidityToken?.address ?? '']

  const [tokenA, tokenB] = [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
  const tokens = {
    [Field.CURRENCY_A]: tokenA,
    [Field.CURRENCY_B]: tokenB,
    [Field.LIQUIDITY]: liquidityToken
  }

  // liquidity values
  const totalSupply = useTotalSupply(liquidityToken)
  const liquidityValueA =
    pair &&
      totalSupply &&
      userLiquidity &&
      tokenA &&
      // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
      JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
      ? (() => {
        const reserve0BN = BigInt(pair?.reserveOf(tokenA!).raw.toString());
        const userLiquidityBN = BigInt(userLiquidity?.raw.toString());
        const totalSupplyBN = BigInt(totalSupply?.raw.toString());
        return new TokenAmount(tokenA, (userLiquidityBN * reserve0BN) / totalSupplyBN)
      })()
      : undefined
  const liquidityValueB =
    pair &&
      totalSupply &&
      userLiquidity &&
      tokenB &&
      // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
      JSBI.greaterThanOrEqual(totalSupply.raw, userLiquidity.raw)
      ? (() => {
        const reserve1BN = BigInt(pair?.reserveOf(tokenB!).raw.toString());
        const userLiquidityBN = BigInt(userLiquidity?.raw.toString());
        const totalSupplyBN = BigInt(totalSupply?.raw.toString());
        return new TokenAmount(tokenB, (userLiquidityBN * reserve1BN) / totalSupplyBN)
      })()
      : undefined
  const liquidityValues: { [Field.CURRENCY_A]?: TokenAmount;[Field.CURRENCY_B]?: TokenAmount } = {
    [Field.CURRENCY_A]: liquidityValueA,
    [Field.CURRENCY_B]: liquidityValueB
  }

  let percentToRemove: Percent = new Percent('0', '100')
  // user specified a %
  if (independentField === Field.LIQUIDITY_PERCENT) {
    percentToRemove = new Percent(typedValue, '100')
  }
  // user specified a specific amount of liquidity tokens
  else if (independentField === Field.LIQUIDITY) {
    if (liquidityToken) {
      const independentAmount = tryParseAmount(typedValue, liquidityToken)
      if (independentAmount && userLiquidity && !independentAmount.greaterThan(userLiquidity)) {
        percentToRemove = new Percent(independentAmount.raw, userLiquidity.raw)
      }
    }
  }
  // user specified a specific amount of token a or b
  else {
    if (tokens[independentField]) {
      const independentAmount = tryParseAmount(typedValue, tokens[independentField])
      const liquidityValue = liquidityValues[independentField]
      if (independentAmount && liquidityValue && !independentAmount.greaterThan(liquidityValue)) {
        percentToRemove = new Percent(independentAmount.raw, liquidityValue.raw)
      }
    }
  }

  const parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.CURRENCY_A]?: TokenAmount
    [Field.CURRENCY_B]?: TokenAmount
  } = {
    [Field.LIQUIDITY_PERCENT]: percentToRemove,
    [Field.LIQUIDITY]:
      userLiquidity && percentToRemove && percentToRemove.greaterThan('0')
        ? new TokenAmount(userLiquidity.token, percentToRemove.multiply(userLiquidity.raw).quotient)
        : undefined,
    [Field.CURRENCY_A]:
      tokenA && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueA
        ? new TokenAmount(tokenA, percentToRemove.multiply(liquidityValueA.raw).quotient)
        : undefined,
    [Field.CURRENCY_B]:
      tokenB && percentToRemove && percentToRemove.greaterThan('0') && liquidityValueB
        ? new TokenAmount(tokenB, percentToRemove.multiply(liquidityValueB.raw).quotient)
        : undefined
  }

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }

  if (!parsedAmounts[Field.LIQUIDITY] || !parsedAmounts[Field.CURRENCY_A] || !parsedAmounts[Field.CURRENCY_B]) {
    error = error ?? 'Enter an amount'
  }

  return { pair, parsedAmounts, error }
}

export function useBurnActionHandlers(): {
  onUserInput: (field: Field, typedValue: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  return {
    onUserInput
  }
}
