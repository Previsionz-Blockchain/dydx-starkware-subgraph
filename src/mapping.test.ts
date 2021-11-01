import { Address, Bytes, ethereum, TypedMap } from "@graphprotocol/graph-ts";
import { test, newMockEvent } from "matchstick-as/assembly/index";
// import { log } from "matchstick-as/assembly/log";
import { ImplementationAdded } from "../generated/CallProxy/CallProxy";

// import { batchOnChainData } from "./batchOnChainData";
import {
  handleImplementationAdded,
  handleLogMemoryPagesHashes,
  handleLogStateTransitionFact,
  handleRegisterContinuousMemoryPage,
} from "./mapping";
import { registerContinuousMemoryPageCall_at_tx0xaeef } from "./test_data/calls/registerContinuousMemoryPageCall_at_tx0xaeef";
import { logStateMemoryPagesHashes_0x3eb1 } from "./test_data/events/logStateMemoryPagesHashes_0x3eb1";
import { logStateTransitionFact_0c3eb1 } from "./test_data/events/logStateTransitionFact_0x3eb1";

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
  test("handleImplementationAdded", () => {
    let implementationAddedEvent = createImplementationAddedEvent(
      "0xcc5b2c75cbbd281b2fc4b58c7d5b080d023c92f2",
      "0x000000000000000000000000894c4a12548fb18eaa48cf34f9cd874fc08b7fc3",
      false
    );
    handleImplementationAdded(implementationAddedEvent);
  });

  test("handleLogStateTransitionFact", () => {
    handleLogStateTransitionFact(logStateTransitionFact_0c3eb1);
  });

  test("handleLogMemoryPagesHashes", () => {
    handleLogMemoryPagesHashes(logStateMemoryPagesHashes_0x3eb1);
  });

  test("handleLogMemoryPageFactContinuous", () => {
    // 3 facts
  });

  test("handleRegisterContinuousMemoryPage", () => {
    // 3 memory pages
    handleRegisterContinuousMemoryPage(
      registerContinuousMemoryPageCall_at_tx0xaeef
    );
  });
  
  // test("data parsing", () => {
  //   parseOnChainData(batchOnChainData);
  // });
}
