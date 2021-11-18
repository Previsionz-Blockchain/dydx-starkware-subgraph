// https://etherscan.io/tx/0x06fe892911582197c3d07fd420b4093dd8852999cecd37d34cb4841e71255241

import { Bytes, ethereum, BigInt } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { LogMemoryPageFactContinuous } from "../../../generated/MemoryPageFactRegistry/MemoryPageFactRegistry";
import { block_12504768 } from "../blocks/block_12504768";
import { ADDRESSES } from "../constants";
import { tx_0xaeef } from "../transactions/tx_0xaeef";

let mockEvent = newMockEvent();

let parameters = new Array<ethereum.EventParam>();

parameters.push(
  new ethereum.EventParam(
    "factHash",
    ethereum.Value.fromBytes(
      Bytes.fromHexString(
        "0x3b2ae9db06f09b358d63738c77fda23caa570e062c8d58fade8d2e75b97a36"
      ) as Bytes
    )
  )
);

parameters.push(
  new ethereum.EventParam(
    "memoryHash",
    ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(
        "2110577927218646395316968675641578127119966886610828862020581938987322646944"
      )
    )
  )
);
parameters.push(
  new ethereum.EventParam(
    "prod",
    ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(
        "2294485096479708898298101101287976635340944109360015070761041436234132971977"
      )
    )
  )
);

export let logMemoryPageFactContinuous_0xaeef = new LogMemoryPageFactContinuous(
  ADDRESSES.get("dYdX: Memory Page Fact Registry"),
  mockEvent.logIndex,
  mockEvent.transactionLogIndex,
  mockEvent.logType,
  block_12504768,
  tx_0xaeef,
  parameters
);
