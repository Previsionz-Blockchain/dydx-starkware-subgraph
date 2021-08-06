import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { clearStore, test } from "matchstick-as/assembly/index";
import { ImplementationAdded } from "../generated/CallProxy/CallProxy";

import { handleImplementationAdded } from "./mapping";

function createImplementationAddedEvent(
  implementation: string,
  initializer: string,
  finalize: boolean
): ImplementationAdded {
  let newImplementationAdded = new ImplementationAdded();
  newImplementationAdded.parameters = new Array<ethereum.EventParam>();

  let implementationParam = new ethereum.EventParam();
  implementationParam.value = ethereum.Value.fromAddress(
    Address.fromString(implementation)
  );

  let initializerParam = new ethereum.EventParam();
  initializerParam.value = ethereum.Value.fromBytes(
    Bytes.fromHexString(initializer) as Bytes
  );

  let finalizeParam = new ethereum.EventParam();
  finalizeParam.value = ethereum.Value.fromBoolean(finalize);

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
  });
}
