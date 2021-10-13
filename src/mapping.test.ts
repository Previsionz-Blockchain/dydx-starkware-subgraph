import {
  Address,
  Bytes,
  ethereum,
  TypedMap,
  BigInt,
} from "@graphprotocol/graph-ts";
import { clearStore, test, newMockEvent } from "matchstick-as/assembly/index";
// import { log } from "matchstick-as/assembly/log";
import { ImplementationAdded } from "../generated/CallProxy/CallProxy";

// import { batchOnChainData } from "./batchOnChainData";
import { handleImplementationAdded } from "./mapping";

function createImplementationAddedEvent(
  implementation: string,
  initializer: string,
  finalize: boolean
): ImplementationAdded {
  let mockEvent = newMockEvent();
  let newImplementationAdded = new ImplementationAdded(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  newImplementationAdded.parameters = new Array();

  let implementationParam = new ethereum.EventParam(
    "implementation",
    ethereum.Value.fromAddress(Address.fromString(implementation))
  );

  let initializerParam = new ethereum.EventParam(
    "initializer",
    ethereum.Value.fromBytes(Bytes.fromHexString(initializer) as Bytes)
  );

  let finalizeParam = new ethereum.EventParam(
    "finalize",
    ethereum.Value.fromBoolean(finalize)
  );

  newImplementationAdded.parameters.push(implementationParam);
  newImplementationAdded.parameters.push(initializerParam);
  newImplementationAdded.parameters.push(finalizeParam);

  return newImplementationAdded;
}

export function runTests(): void {
  test("test name", () => {
    let implementationAddedEvent = createImplementationAddedEvent(
      "0xcc5b2c75cbbd281b2fc4b58c7d5b080d023c92f2",
      "0x000000000000000000000000894c4a12548fb18eaa48cf34f9cd874fc08b7fc3",
      false
    );
    handleImplementationAdded(implementationAddedEvent);
  });

  // test("data parsing", () => {
  //   parseOnChainData(batchOnChainData);
  // });
}
