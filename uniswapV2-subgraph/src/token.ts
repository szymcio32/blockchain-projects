import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { ERC20 } from '../generated/UniswapFactory/ERC20'
import { Token } from '../generated/schema'


export function createToken(id: string): Token {
  let token = Token.load(id)

  if (token === null) {
    token = new Token(id)
    const contract = ERC20.bind(Address.fromString(id))
    token.name = getTokenName(contract)
    token.symbol = getTokenSymbol(contract)
    token.decimals = getTokenDecimals(contract)

    token.save()
  }

  return token as Token
}


function getTokenName(contract: ERC20): string {
  let nameValue = 'unknown'
  const name = contract.try_name()
  if (!name.reverted) {
    nameValue = name.value.toString()
  }
  return nameValue
}


function getTokenSymbol(contract: ERC20): string {
  let symbolValue = 'unknown'
  const symbol = contract.try_symbol()
  if (!symbol.reverted) {
    symbolValue = symbol.value.toString()
  }
  return symbolValue
}


function getTokenDecimals(contract: ERC20): BigInt {
  let decimalValue = BigInt.fromI32(18)
  const decimals = contract.try_decimals()
  if (!decimals.reverted) {
    decimalValue = BigInt.fromI32(decimals.value)
  }
  return decimalValue
}