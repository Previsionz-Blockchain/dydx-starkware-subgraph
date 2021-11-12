import { Address, Bytes, ethereum, TypedMap } from "@graphprotocol/graph-ts";
import { test, newMockEvent } from "matchstick-as/assembly/index";
// import { log } from "matchstick-as/assembly/log";
import { ImplementationAdded } from "../generated/CallProxy/CallProxy";

// import { batchOnChainData } from "./batchOnChainData";
import {
  handleImplementationAdded,
  handleLogMemoryPageFactContinuous,
  handleLogMemoryPagesHashes,
  handleLogStateTransitionFact,
  handleRegisterContinuousMemoryPage,
} from "./mapping";
import { registerContinuousMemoryPageCall_at_tx0xaeef } from "./test_data/calls/registerContinuousMemoryPageCall_at_tx0xaeef";
import { registerContinuousMemoryPageCall_at_tx0x7431 } from "./test_data/calls/registerContinuousMemoryPageCall_at_tx0x7431";
import { registerContinuousMemoryPageCall_at_tx0x06fe } from "./test_data/calls/registerContinuousMemoryPageCall_at_tx0x06fe";
import { logStateMemoryPagesHashes_0x3eb1 } from "./test_data/events/logStateMemoryPagesHashes_0x3eb1";
import { logStateTransitionFact_0c3eb1 } from "./test_data/events/logStateTransitionFact_0x3eb1";
import { logMemoryPageFactContinuous_0x06fe } from "./test_data/events/logMemoryPageFactContinuous_0x06fe";
import { logMemoryPageFactContinuous_0x7431 } from "./test_data/events/logMemoryPageFactContinuous_0x7431";
import { logMemoryPageFactContinuous_0xaeef } from "./test_data/events/logMemoryPageFactContinuous_0xaeef";

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

  test("handleRegisterContinuousMemoryPage", () => {
    // 3 memory pages
    handleRegisterContinuousMemoryPage(
      registerContinuousMemoryPageCall_at_tx0x06fe
    );
    handleRegisterContinuousMemoryPage(
      registerContinuousMemoryPageCall_at_tx0xaeef
    );
    handleRegisterContinuousMemoryPage(
      registerContinuousMemoryPageCall_at_tx0x7431
    );
  });
  test("handleLogMemoryPageFactContinuous", () => {
    handleLogMemoryPageFactContinuous(logMemoryPageFactContinuous_0x06fe);
    handleLogMemoryPageFactContinuous(logMemoryPageFactContinuous_0x7431);
    handleLogMemoryPageFactContinuous(logMemoryPageFactContinuous_0xaeef);
  });
  test("handleLogMemoryPagesHashes", () => {
    handleLogMemoryPagesHashes(logStateMemoryPagesHashes_0x3eb1);
  });

  //   test("parseOnChainData", () => {
  //     let parsedOnChainData = parseOnChainData(batchOnChainData2);
  //     let positionStateUpdate = dumpOnChainData(parsedOnChainData.updates);

  //     let values = parsedOnChainData.unparsedValues.concat(batchOnChainData3);
  //     let parsedOnChainData2 = createPositionStateUpdates(values);
  //     let positionUpdate = dumpOnChainData(parsedOnChainData2);

  //     for (let i = 0; i < values.length; i++) {
  //       log.debug("LEFTOVER #{}={}", [i.toString(), values[i].toHexString()]);
  //     }

  //     // let lower = BigInt.fromI32(0).minus(BigInt.fromI32(2).pow(63));
  //   });

  //   test("data parsing", () => {
  //     parseOnChainData(batchOnChainData);
  //   });
}
