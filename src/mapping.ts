import { Address, log, store } from "@graphprotocol/graph-ts";

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

export { runTests } from "./mapping.test";

function hexZeroPad(hexstring: string, length: i32 = 32): string {
  return hexstring.substr(0, 2) + hexstring.substr(2).padStart(length * 2, "0");
}

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
  entity.stateTransitionFact = event.params.stateTransitionFact;
  entity.timestamp = event.block.timestamp;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.transactionHash = event.transaction.hash;
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

  entity.stateTransitionFact = event.params.factHash.toHexString();

  let memoryPageFacts = new Array<string>();
  for (let i = 0; i < pagesHashes.length; i++) {
    memoryPageFacts.push(pagesHashes[i].toHexString());
  }

  entity.memoryPageFacts = memoryPageFacts;

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
  let id = hexZeroPad(memoryHash.toHexString());

  log.info("handleLogMemoryPageFactContinuous - factHash: {}, memoryHash: {}", [
    factHash.toHexString(),
    hexZeroPad(memoryHash.toHexString()),
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

  entity.memoryPage = event.transaction.hash.toHex();

  /**
   * Would need to upgrade AssemblyScript version
   * https://thegraph.com/docs/developer/assemblyscript-api#encodingdecoding-abi
   * */
  // entity.input = event.transaction.input;
  entity.save();
}

export function handleRegisterContinuousMemoryPage(
  call: RegisterContinuousMemoryPageCall
): void {
  let id = call.transaction.hash.toHex();
  let memoryPage = new MemoryPage(id);
  memoryPage.blockNumber = call.block.number;
  memoryPage.blockHash = call.block.hash;
  memoryPage.timestamp = call.block.timestamp;
  memoryPage.transactionHash = call.transaction.hash;

  memoryPage.startAddr = call.inputs.startAddr;
  memoryPage.values = call.inputs.values;
  memoryPage.z = call.inputs.z;
  memoryPage.alpha = call.inputs.alpha;
  memoryPage.prime = call.inputs.prime;
  memoryPage.save();
}

export function handleImplementationAdded(event: ImplementationAdded): void {
  let id =
    event.transaction.hash.toHexString() + ":" + event.logIndex.toHexString();

  log.info(
    "handleImplementationAdded - implementation: {}, txHash {}, initalizer: {}, ",
    [
      event.params.implementation.toHexString(),
      event.transaction.hash.toHexString(),
      event.params.initializer.toHexString(),
    ]
  );

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
  
  let addressString = event.params.initializer.toHexString()
  addressString = addressString.substring(addressString.length-42)
  // TODO: This is kinda ugly. At least do comparison @byte lvl or RegExp (if as supports it)?
  while (addressString.startsWith("0")){
    addressString = addressString.substring(1)
  }
  GpsStatementVerifier.create(Address.fromString(addressString));
}

export function handleUpgraded(event: Upgraded): void {
  let id =
    event.transaction.hash.toHexString() + ":" + event.logIndex.toHexString();

  log.info("handleUpgraded - implementation: {}", [
    event.params.implementation.toHexString(),
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
