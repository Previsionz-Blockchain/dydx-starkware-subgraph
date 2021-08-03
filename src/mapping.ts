import { BigInt, log } from "@graphprotocol/graph-ts";
import { LogStateTransitionFact } from "../generated/StarkPerpetual/StarkPerpetual";
import { LogMemoryPageFactContinuous } from "../generated/MemoryPageFactRegistry/MemoryPageFactRegistry";
import { LogMemoryPagesHashes } from "../generated/GpsStatementVerifier/GpsStatementVerifier";
import {
  ImplementationAdded,
  Upgraded,
} from "../generated/CallProxy/CallProxy";
import {
  StateTransitionFact,
  MemoryPageFact,
  MemoryPageHash,
  ProxyEvent,
} from "../generated/schema";

/**
 * In python: main_contract_events
 */
export function handleLogStateTransitionFact(
  event: LogStateTransitionFact
): void {
  let stateTransitionFact = event.params.stateTransitionFact.toHexString();

  log.info("handleLogStateTransitionFact - stateTransitionFact: {}", [
    stateTransitionFact,
  ]);

  let entity = new StateTransitionFact(stateTransitionFact);
  entity.timestamp = event.block.timestamp;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

/**
 * In python: memory_page_map
 */
export function handleLogMemoryPageFactContinuous(
  event: LogMemoryPageFactContinuous
): void {
  let factHash = event.params.factHash;
  let memoryHash = event.params.memoryHash;
  let id = factHash.toHexString() + ":" + memoryHash.toHexString();

  log.info("handleLogMemoryPageFactContinuous - factHash: {}, memoryHash: {}", [
    factHash.toHexString(),
    memoryHash.toString(),
  ]);

  let entity = new MemoryPageFact(id);
  entity.timestamp = event.block.timestamp;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.transactionHash = event.transaction.hash;

  entity.factHash = factHash;
  entity.memoryHash = memoryHash;
  entity.prod = event.params.prod;
  entity.stateTransitionFact = factHash;
  entity.save();
}

/**
 * In python: memory_page_facts_logs ?
 */
export function handleLogMemoryPagesHashes(event: LogMemoryPagesHashes): void {
  let factHash = event.params.factHash;
  let pagesHashes = event.params.pagesHashes;
  let id =
    event.transaction.hash.toHexString() + ":" + event.logIndex.toHexString();

  log.info("handleLogMemoryPagesHashes - factHash: {}, pagesHashes: {}", [
    factHash.toHexString(),
    pagesHashes.toString(),
  ]);

  let entity = new MemoryPageHash(id);
  entity.timestamp = event.block.timestamp;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.transactionHash = event.transaction.hash;

  entity.factHash = factHash;
  entity.pagesHashes = pagesHashes;
  entity.save();
}

export function handleImplementationAdded(event: ImplementationAdded): void {
  let id =
    event.transaction.hash.toHexString() + ":" + event.logIndex.toHexString();

  log.info("handleImplementationAdded - implementation: {}", [
    event.params.implementation.toString(),
  ]);

  let entity = new ProxyEvent(id);
  entity.timestamp = event.block.timestamp;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.transactionHash = event.transaction.hash;

  entity.implementation = event.params.implementation;
  entity.initializer = event.params.initializer;
  entity.finalize = event.params.finalize;
  entity.type = "ADDED";
  entity.save();
}

export function handleUpgraded(event: Upgraded): void {
  let id =
    event.transaction.hash.toHexString() + ":" + event.logIndex.toHexString();

  log.info("handleUpgraded - implementation: {}", [
    event.params.implementation.toString(),
  ]);

  let entity = new ProxyEvent(id);
  entity.timestamp = event.block.timestamp;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.transactionHash = event.transaction.hash;

  entity.implementation = event.params.implementation;
  entity.type = "UPGRADED";
  entity.save();
}
