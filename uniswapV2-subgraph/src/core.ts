import { log } from '@graphprotocol/graph-ts'
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Sync, Swap as SwapEvent, Transfer } from "../generated/templates/Pair/Pair"
import { Pair, Swap, Token, Factory } from "../generated/schema"
import { ADDRESS_ZERO, FACTORY_ADDRESS } from "./constants"
import { convertTokenToDecimal, getLiquidityPosition, createUser } from "./utils"


export function onSwap(event: SwapEvent): void {
  const pair = Pair.load(event.address.toHexString()) as Pair
  const token0 = Token.load(pair.token0) as Token
  const token1 = Token.load(pair.token1) as Token
  const factory = Factory.load(FACTORY_ADDRESS) as Factory


  const amount0In = convertTokenToDecimal(event.params.amount0In, token0.decimals)
  const amount1In = convertTokenToDecimal(event.params.amount1In, token1.decimals)
  const amount0Out = convertTokenToDecimal(event.params.amount0Out, token0.decimals)
  const amount1Out = convertTokenToDecimal(event.params.amount1Out, token1.decimals)


  const amount0Total = amount0Out.plus(amount0In)
  const amount1Total = amount1Out.plus(amount1In)


  const volumeUSD = amount0Total.times(pair.token0Price).plus(amount1Total.times(pair.token1Price)).div(BigDecimal.fromString('2'))
  pair.volumeUSD = pair.volumeUSD.plus(volumeUSD)
  factory.volumeUSD = factory.volumeUSD.plus(volumeUSD)

  const swap = new Swap(event.transaction.hash.toHexString())
  swap.pair = pair.id
  swap.timestamp = event.block.timestamp
  swap.token0Symbol = token0.symbol
  swap.token1Symbol = token1.symbol
  swap.amount0In = amount0In
  swap.amount1In = amount1In
  swap.amount0Out = amount0Out
  swap.amount1Out = amount1Out
  swap.sender = event.params.sender.toHexString()
  swap.to = event.params.to.toHexString()
  swap.amountUSD = volumeUSD

  swap.save()
  pair.save()
  factory.save()
}

export function onSync(event: Sync): void {
  const pair = Pair.load(event.address.toHexString()) as Pair
  const token0 = Token.load(pair.token0) as Token
  const token1 = Token.load(pair.token1) as Token
  const factory = Factory.load(FACTORY_ADDRESS) as Factory

  pair.reserve0 = convertTokenToDecimal(event.params.reserve0, token0.decimals)
  pair.reserve1 = convertTokenToDecimal(event.params.reserve1, token1.decimals)

  // calculate price
  if (pair.reserve1.notEqual(BigDecimal.fromString('0'))) {
    pair.token0Price = pair.reserve0.div(pair.reserve1)
  } else {
    pair.token0Price = BigDecimal.fromString('0')
  }

  if (pair.reserve0.notEqual(BigDecimal.fromString('0'))) {
    pair.token1Price = pair.reserve1.div(pair.reserve0)
  } else {
    pair.token1Price = BigDecimal.fromString('0')
  }

  // calculate liquidity
  const pairLiquidityUSD = pair.reserve0.times(pair.token0Price).plus(pair.reserve1.times(pair.token1Price))
  pair.totalLiquidityUSD = pairLiquidityUSD
  factory.totalLiquidityUSD = factory.totalLiquidityUSD.plus(pairLiquidityUSD)

  pair.save()
  factory.save()
}

export function onTransfer(event: Transfer): void {
  createUser(event.params.from)
  createUser(event.params.to)

  if (event.params.from.toHexString() != ADDRESS_ZERO && event.params.from != event.address) {
    const fromUserLiquidityPosition = getLiquidityPosition(event.params.from, event.address, event.block.timestamp)
    const value = convertTokenToDecimal(event.params.value, BigInt.fromI32(18))
    fromUserLiquidityPosition.balance = fromUserLiquidityPosition.balance.minus(value)
    fromUserLiquidityPosition.save()
  }

  if (event.params.to.toHexString() != ADDRESS_ZERO && event.params.to != event.address) {
    const toUserLiquidityPosition = getLiquidityPosition(event.params.to, event.address, event.block.timestamp)
    const value = convertTokenToDecimal(event.params.value, BigInt.fromI32(18))
    toUserLiquidityPosition.balance = toUserLiquidityPosition.balance.plus(value)
    toUserLiquidityPosition.save()
  }

}