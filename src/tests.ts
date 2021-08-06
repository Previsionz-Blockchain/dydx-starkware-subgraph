import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { clearStore, test } from "matchstick-as/assembly/index";
import { ImplementationAdded } from "../generated/CallProxy/CallProxy";

import { handleImplementationAdded } from "./mapping";

function createImplementationAddedEvent(
  implementation: string
  //   initializer: Bytes,
  //   finalize: boolean
): ImplementationAdded {
  let newImplementationAdded = new ImplementationAdded();
  ImplementationAdded.parameters = new Array<ethereum.EventParam>();

  let implementationParam = new ethereum.EventParam();
  implementationParam.value = ethereum.Value.fromAddress(
    Address.fromString(implementation)
  );

  ImplementationAdded.parameters.push(implementationParam);

  return ImplementationAdded;
}

// import { Gravatar } from "../../generated/schema";
// import {
//   createNewGravatarEvent,
//   handleNewGravatars,
// } from "../mappings/gravity";

export function runTests(): void {
  test("Noop", () => {
    let implementationAddedEvent = createImplementationAddedEvent(
      "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7"
    );

    // Initialise
    // let gravatar = new Gravatar("gravatarId0");
    // gravatar.save();

    // // Call mappings
    // let newGravatarEvent = createNewGravatarEvent(
    //   12345,
    //   "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
    //   "cap",
    //   "pac"
    // );
    // let anotherGravatarEvent = createNewGravatarEvent(
    //   3546,
    //   "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
    //   "cap",
    //   "pac"
    // );

    // handleNewGravatars([newGravatarEvent, anotherGravatarEvent]);

    // // Assert the state of the store
    // store.assertFieldEq(
    //   GRAVATAR_ENTITY_TYPE,
    //   "gravatarId0",
    //   "id",
    //   "gravatarId0"
    // );
    // store.assertFieldEq(GRAVATAR_ENTITY_TYPE, "12345", "id", "12345");
    // store.assertFieldEq(GRAVATAR_ENTITY_TYPE, "3546", "id", "3546");

    clearStore();
  });
}
