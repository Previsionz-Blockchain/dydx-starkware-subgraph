import {
  Address,
  Bytes,
  ethereum,
  TypedMap,
  BigInt,
} from "@graphprotocol/graph-ts";
import { clearStore, test, addMetadata } from "matchstick-as/assembly/index";
// import { log } from "matchstick-as/assembly/log";
import { ImplementationAdded } from "../generated/CallProxy/CallProxy";

// import { batchOnChainData } from "./batchOnChainData";
import { handleImplementationAdded } from "./mapping";

function createImplementationAddedEvent(
  implementation: string,
  initializer: string,
  finalize: boolean
): ImplementationAdded {
  let base: ImplementationAdded = new ImplementationAdded();
  let newImplementationAdded = addMetadata(base) as ImplementationAdded;
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

// /*
//   Represents a collection of timestamped global funding indices for all assets.

//   :param indices: Map of synthetic asset to its global funding index.
//   :type indices: Mapping[int, int]
//   :param timestamp: The timestamp for which the funding indices are valid for.
//   :type timestamp: int
//  */
// class FundingIndicesState {
//   indices: TypedMap<BigInt, i32>;
//   timestamp: i32;
// }

// /*
//   Holds inforamation about a single position update.
//   Members:
//     - position_id: the id of the position the update refers to.
//     - public_key: the new public key of the position.
//     - collateral_balance: the new amount of collateral_balance of the position.
//     - funding_timestamp: The timestamp of the last funding that was applied to the position.
//     - asset_balance_updates: information regarding the assets that changed in the position
//     (contains asset_id and balance)
// */
// class PositionStateUpdate {
//   positionId: i32;
//   publicKey: Address;
//   collateralBalance: i32;
//   fundingTimestamp: i32;
//   assetBalanceUpdates: TypedMap<BigInt, i32>;
// }

// /*
// Dataclass for storing the onchain data.
// */
// class PerpetualOnChainData {
//   fundingIndicesMapping: TypedMap<i32, FundingIndicesState>;
//   updates: PositionStateUpdate[];
// }

// function parseOnChainData(values: BigInt[]): void {}

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
