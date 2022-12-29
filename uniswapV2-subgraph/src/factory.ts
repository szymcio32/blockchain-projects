import { BigDecimal } from '@graphprotocol/graph-ts'
import { PairCreated as PairCreatedEvent } from "../generated/UniswapFactory/UniswapFactory"
import { Pair, Factory } from "../generated/schema"
import { Pair as PairTemplate } from "../generated/templates"
import { FACTORY_ADDRESS } from "./constants"
import { createToken } from "./token"


export function handlePairCreated(event: PairCreatedEvent): void {
  let factory = Factory.load(FACTORY_ADDRESS)

  if (factory === null) {
    factory = new Factory(FACTORY_ADDRESS)
    factory.totalLiquidityUSD = BigDecimal.fromString('0')
    factory.volumeUSD = BigDecimal.fromString('0')
    factory.pairCount = 0
  }

  factory.pairCount = factory.pairCount + 1

  const token0 = createToken(event.params.token0.toHexString())
  const token1 = createToken(event.params.token1.toHexString())

  let pair = new Pair(event.params.pair.toHexString()) as Pair
  pair.token0 = token0.id
  pair.token1 = token1.id
  pair.name = token0.symbol.concat('-').concat(token1.symbol)
  pair.token0Price = BigDecimal.fromString('0')
  pair.token1Price = BigDecimal.fromString('0')
  pair.reserve0 = BigDecimal.fromString('0')
  pair.reserve1 = BigDecimal.fromString('0')
  pair.totalLiquidityUSD = BigDecimal.fromString('0')
  pair.volumeUSD = BigDecimal.fromString('0')

  PairTemplate.create(event.params.pair)

  factory.save()
  pair.save()
}
