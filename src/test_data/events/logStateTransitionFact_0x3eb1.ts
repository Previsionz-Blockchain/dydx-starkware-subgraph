import { Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { LogStateTransitionFact } from "../../../generated/StarkPerpetual/StarkPerpetual";
import { block_12504768 } from "../blocks/block_12504768";
import { ADDRESSES } from "../constants";
import { tx_0x2908 } from "../transactions/tx_0x2908";

let mockEvent = newMockEvent();

let parameters = new Array<ethereum.EventParam>();

parameters.push(
  new ethereum.EventParam(
    "initializer",
    ethereum.Value.fromBytes(
      Bytes.fromHexString(
        "0x3eb10acfb02f04b0aa7cd8d1dc53cad933840c83195a2bf10bd61d3513fb9c13"
      ) as Bytes
    )
  )
);

export let logStateTransitionFact_0c3eb1 = new LogStateTransitionFact(
  // we only overwrite the values that we actually use
  ADDRESSES.get("dYdX: L2 Perpetual Smart Contract"),
  mockEvent.logIndex,
  mockEvent.transactionLogIndex,
  mockEvent.logType,
  block_12504768,
  // txHash: 0x29084ceb8b02282e35f4dd277a63efea157d105d20bd670727e81bc455e7fd8a
  tx_0x2908,
  parameters
);
