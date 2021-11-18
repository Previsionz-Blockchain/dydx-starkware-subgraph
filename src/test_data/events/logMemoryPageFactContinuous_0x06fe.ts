// https://etherscan.io/tx/0x06fe892911582197c3d07fd420b4093dd8852999cecd37d34cb4841e71255241

import { Bytes, ethereum, BigInt } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { LogMemoryPageFactContinuous } from "../../../generated/MemoryPageFactRegistry/MemoryPageFactRegistry";
import { block_12504768 } from "../blocks/block_12504768";
import { ADDRESSES } from "../constants";
import { tx_0x06fe } from "../transactions/tx_0x06fe";

let mockEvent = newMockEvent();

let parameters = new Array<ethereum.EventParam>();

parameters.push(
  new ethereum.EventParam(
    "factHash",
    ethereum.Value.fromBytes(
      Bytes.fromHexString(
        "0x644D60576921C5680858E7EC572DD2CF0070E57D7E4D540521E644D2642B8160"
      ) as Bytes
    )
  )
);

parameters.push(
  new ethereum.EventParam(
    "memoryHash",
    ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(
        "24217084756645265379813213444929270446500650016663454921781153610815627228088"
      )
    )
  )
);
parameters.push(
  new ethereum.EventParam(
    "prod",
    ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(
        "1658940651251202240656571336146301381153271968314396349347042513735854411607"
      )
    )
  )
);

export let logMemoryPageFactContinuous_0x06fe = new LogMemoryPageFactContinuous(
  ADDRESSES.get("dYdX: Memory Page Fact Registry"),
  mockEvent.logIndex,
  mockEvent.transactionLogIndex,
  mockEvent.logType,
  block_12504768,
  tx_0x06fe,
  parameters
);
