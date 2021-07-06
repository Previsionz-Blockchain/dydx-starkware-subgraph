import { BigInt, log } from "@graphprotocol/graph-ts";
import { LogStateTransitionFact } from "../generated/StarkPerpetual/StarkPerpetual";
import { LogMemoryPageFactContinuous } from "../generated/MemoryPageFactRegistry/MemoryPageFactRegistry";
import { StateTransitionFact, MemoryPageFact } from "../generated/schema";

export function handleLogStateTransitionFact(
  event: LogStateTransitionFact
): void {
  let stateTransitionFact = event.params.stateTransitionFact.toHexString();

  log.info("stateTransitionFact: {}", [stateTransitionFact]);

  let entity = new StateTransitionFact(stateTransitionFact);
  entity.blockNumber = event.block.number;
  entity.save();
}

export function handleLogMemoryPageFactContinuous(
  event: LogMemoryPageFactContinuous
): void {
  let factHash = event.params.factHash;
  let memoryHash = event.params.memoryHash;
  let id = factHash.toHexString() + memoryHash.toHexString();

  log.info("factHash: {}, memoryHash: {}", [
    factHash.toHexString(),
    memoryHash.toString(),
  ]);

  let entity = new MemoryPageFact(id);
  entity.factHash = factHash;
  entity.memoryHash = memoryHash;
  entity.prod = event.params.prod;
  entity.blockNumber = event.block.number;
  entity.stateTransitionFact = factHash.toHexString();
  entity.save();
}

// export function handleFinalizedImplementation(
//   event: FinalizedImplementation
// ): void {
//   // Entities can be loaded from the store using a string ID; this ID
//   // needs to be unique across all entities of the same type
//   let entity = ExampleEntity.load(event.transaction.from.toHex());

//   // Entities only exist after they have been saved to the store;
//   // `null` checks allow to create entities on demand
//   if (entity == null) {
//     entity = new ExampleEntity(event.transaction.from.toHex());

//     // Entity fields can be set using simple assignments
//     entity.count = BigInt.fromI32(0);
//   }

//   // BigInt and BigDecimal math are supported
//   entity.count = entity.count + BigInt.fromI32(1);

//   // Entity fields can be set based on event parameters
//   entity.implementation = event.params.implementation;

//   // Entities can be written to the store with `.save()`
//   entity.save();

//   // Note: If a handler doesn't require existing field values, it is faster
//   // _not_ to load the entity from the store. Instead, create it fresh with
//   // `new Entity(...)`, set the fields that should be updated and save the
//   // entity back to the store. Fields that were not set or unset remain
//   // unchanged, allowing for partial updates to be applied.

//   // It is also possible to access smart contracts from mappings. For
//   // example, the contract that has emitted the event can be connected to
//   // with:
//   //
//   // let contract = Contract.bind(event.address)
//   //
//   // The following functions can then be called on this contract to access
//   // state variables and other data:
//   //
//   // - contract.MAIN_DISPATCHER_SAFEGUARD_SLOT(...)
//   // - contract.PROXY_GOVERNANCE_TAG(...)
//   // - contract.UPGRADE_DELAY_SLOT(...)
//   // - contract.getUpgradeActivationDelay(...)
//   // - contract.implementation(...)
//   // - contract.isNotFinalized(...)
//   // - contract.proxyIsGovernor(...)
// }

// export function handleImplementationAdded(event: ImplementationAdded): void {}

// export function handleImplementationRemoved(
//   event: ImplementationRemoved
// ): void {}

// export function handleLogNewGovernorAccepted(
//   event: LogNewGovernorAccepted
// ): void {}

// export function handleLogNominatedGovernor(event: LogNominatedGovernor): void {}

// export function handleLogNominationCancelled(
//   event: LogNominationCancelled
// ): void {}

// export function handleLogRemovedGovernor(event: LogRemovedGovernor): void {}

// export function handleUpgraded(event: Upgraded): void {}
