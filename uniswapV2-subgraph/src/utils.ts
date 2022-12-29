import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { LiquidityPosition, Pair, User } from "../generated/schema"
import { USDC_WETH_PAIR } from "./constants"

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == BigInt.fromI32(0)) {
    return tokenAmount.toBigDecimal()
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}


function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = BigInt.fromI32(0); i.lt(decimals as BigInt); i = i.plus(BigInt.fromI32(1))) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}


export function getEthPriceInUSD(): BigDecimal {
  const usdcPair = Pair.load(USDC_WETH_PAIR)
  let price = BigDecimal.fromString('0')
  if (usdcPair !== null) {
    price = usdcPair.token0Price
  }
  return price
}

export function getLiquidityPosition(user: Address, pair: Address, timestamp: BigInt): LiquidityPosition {
  const pairAddress = pair.toHexString()
  const userAddress = user.toHexString()
  const liquidityPositionId = pairAddress.concat('-').concat(userAddress)

  let liquidityPosition = LiquidityPosition.load(liquidityPositionId)

  if (liquidityPosition === null) {
    liquidityPosition = new LiquidityPosition(liquidityPositionId)
    liquidityPosition.user = userAddress
    liquidityPosition.pair = pairAddress
    liquidityPosition.balance = BigDecimal.fromString('0')
    liquidityPosition.createdAtTimestamp = timestamp

    liquidityPosition.save()
  }

  return liquidityPosition as LiquidityPosition
}

export function createUser(address: Address): void {
  let user = User.load(address.toHexString())
  if (user === null) {
    user = new User(address.toHexString())
    user.save()
  }
}