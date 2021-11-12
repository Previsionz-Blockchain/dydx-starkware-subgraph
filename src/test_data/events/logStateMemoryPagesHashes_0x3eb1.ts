import { Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { LogMemoryPagesHashes } from "../../../generated/templates/GpsStatementVerifier/GpsStatementVerifier";
import { block_12504768 } from "../blocks/block_12504768";
import { ADDRESSES } from "../constants";
import { tx_0x5490 } from "../transactions/tx_0x5490";

let mockEvent = newMockEvent()

let parameters = new Array<ethereum.EventParam>();

parameters.push(
  new ethereum.EventParam(
    "factHash", ethereum.Value.fromBytes(Bytes.fromHexString("0x3eb10acfb02f04b0aa7cd8d1dc53cad933840c83195a2bf10bd61d3513fb9c13") as Bytes)
  )
);

let pagesHashesArray = new Array<Bytes>();
pagesHashesArray.push(Bytes.fromHexString("0x358a625d4f88358b346ca5dbb5ed2a26fb02f22e2090531b2ff5529d0ad273b8") as Bytes)
pagesHashesArray.push(Bytes.fromHexString("0x04aa8b764a9c25bb4e3a5464c504dfa9a2b3f00a7e245666ee6d70d4bae121a0") as Bytes)
pagesHashesArray.push(Bytes.fromHexString("0x09c2386ebcbda70f5df573b72a415f07693fd1b976555f64aa08fd9a1f7f738a") as Bytes)
parameters.push(
  new ethereum.EventParam(
    "pagesHashes", ethereum.Value.fromFixedBytesArray(pagesHashesArray)
  )
)

export let logStateMemoryPagesHashes_0x3eb1 = new LogMemoryPagesHashes(
  ADDRESSES.get("dYdX: Memory Page Fact Registry"),
  mockEvent.logIndex,
  mockEvent.transactionLogIndex,
  mockEvent.logType,
  block_12504768,
  tx_0x5490,
  parameters
)