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

export function runTests(): void {
    test("test name", () => {
        let implementationAddedEvent = createImplementationAddedEvent(
            "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7"
          );
    })
}