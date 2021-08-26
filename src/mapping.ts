import {
  Address,
  BigInt,
  log,
  ethereum,
  Bytes,
  ByteArray,
} from "@graphprotocol/graph-ts";

import { LogStateTransitionFact } from "../generated/StarkPerpetual/StarkPerpetual";
import {
  LogMemoryPageFactContinuous,
  RegisterContinuousMemoryPageCall,
} from "../generated/MemoryPageFactRegistry/MemoryPageFactRegistry";
import {
  ImplementationAdded,
  Upgraded,
} from "../generated/CallProxy/CallProxy";
import { LogMemoryPagesHashes } from "../generated/templates/GpsStatementVerifier/GpsStatementVerifier";

import {
  StateTransitionFact,
  MemoryPageFact,
  MemoryPageHash,
  ProxyEvent,
  MemoryPage,
} from "../generated/schema";
import { GpsStatementVerifier } from "../generated/templates";

// export { runTests } from "./mapping.test";

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
  entity.memoryHash = memoryHash.toHexString();
  entity.prod = event.params.prod;
  entity.stateTransitionFact = factHash;

  entity.input = event.transaction.input;
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
    event.params.implementation.toHexString(),
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

  let contractAddress = "0x" + event.params.initializer.toHexString().slice(26);

  GpsStatementVerifier.create(
    Address.fromHexString(contractAddress) as Address
  );
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

export function handleRegisterContinuousMemoryPage(
  call: RegisterContinuousMemoryPageCall
): void {
  let id = call.transaction.hash.toHex();
  let memoryPage = new MemoryPage(id);
  memoryPage.startAddr = call.inputs.startAddr;
  memoryPage.values = call.inputs.values;
  memoryPage.z = call.inputs.z;
  memoryPage.alpha = call.inputs.alpha;
  memoryPage.prime = call.inputs.prime;
  memoryPage.save();
}
