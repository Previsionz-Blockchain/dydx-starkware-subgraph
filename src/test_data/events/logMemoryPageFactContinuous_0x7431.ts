// https://etherscan.io/tx/0x06fe892911582197c3d07fd420b4093dd8852999cecd37d34cb4841e71255241

import { Bytes, ethereum, BigInt } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { LogMemoryPageFactContinuous } from "../../../generated/MemoryPageFactRegistry/MemoryPageFactRegistry";
import { block_12504768 } from "../blocks/block_12504768";
import { ADDRESSES } from "../constants";
import { tx_0x7431 } from "../transactions/tx_0x7431";

let mockEvent = newMockEvent();

let parameters = new Array<ethereum.EventParam>();

parameters.push(
  new ethereum.EventParam(
    "factHash",
    ethereum.Value.fromBytes(
      Bytes.fromHexString(
        "0xf8699bd5296d505c0158689a4b8e89cd022bc0a29833024617eaf5e633f488f1"
      ) as Bytes
    )
  )
);

parameters.push(
  new ethereum.EventParam(
    "memoryHash",
    ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(
        "4413973451082687092577509280514585638453429203343588629476443400223758185354"
      )
    )
  )
);
parameters.push(
  new ethereum.EventParam(
    "prod",
    ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(
        "3519070399260826237898878351071053809931353797364604409397382244731900210064"
      )
    )
  )
);

export let logMemoryPageFactContinuous_0x7431 = new LogMemoryPageFactContinuous(
  ADDRESSES.get("dYdX: Memory Page Fact Registry"),
  mockEvent.logIndex,
  mockEvent.transactionLogIndex,
  mockEvent.logType,
  block_12504768,
  tx_0x7431,
  parameters
);
