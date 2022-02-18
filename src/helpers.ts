import { BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts'

export function updateTokenDayData(token: Token, event: Event): TokenDayData {
    let bundle = Bundle.load('1')
    let timestamp = event.block.timestamp.toI32()
    let dayID = timestamp / 86400
    let dayStartTimestamp = dayID * 86400
    let tokenDayID = token.id
      .toString()
      .concat('-')
      .concat(BigInt.fromI32(dayID).toString())