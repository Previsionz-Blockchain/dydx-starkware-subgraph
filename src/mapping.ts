import { Address, log, BigInt, BigDecimal } from "@graphprotocol/graph-ts";

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
  Vault,
  Token,
  TokenBalance,
  Transaction,
} from "../generated/schema";
import { GpsStatementVerifier } from "../generated/templates";
import { parseOnChainData, dumpOnChainData } from "./parseOnChainData";

// export { runTests } from "./mapping.test";

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
  let memoryPageHashId =
    event.transaction.hash.toHexString() + ":" + event.logIndex.toHexString();

  log.info("handleLogMemoryPagesHashes - factHash: {}", [
    factHash.toHexString(),
  ]);

  for (let i = 0; i < pagesHashes.length; i++) {
    log.info("handleLogMemoryPagesHashes - pagesHashes #{}: {}", [
      i.toString(),
      pagesHashes[i].toHexString(),
    ]);
  }

  let entity = new MemoryPageHash(memoryPageHashId);
  entity.timestamp = event.block.timestamp;
  entity.blockNumber = event.block.number;
  entity.blockHash = event.block.hash;
  entity.transactionHash = event.transaction.hash;

  entity.factHash = factHash;
  entity.pagesHashes = pagesHashes;

  entity.stateTransitionFact = event.params.factHash.toHexString();

  let memoryPageFacts = new Array<string>();
  let values = new Array<BigInt>();
  for (let i = 0; i < pagesHashes.length; i++) {
    memoryPageFacts.push(pagesHashes[i].toHexString());
    if (i == 0) continue;
    let memoryPageFact = MemoryPageFact.load(pagesHashes[i].toHexString())!;

    let memoryPage = MemoryPage.load(
      memoryPageFact.transactionHash.toHexString()
    )!;
    values = values.concat(memoryPage.values);
  }

  let parsedData = parseOnChainData(values);
  let dumpedData = dumpOnChainData(parsedData.updates).entries;
  for (let i = 0; i < dumpedData.length; i++) {
    let internVault = dumpedData[i].value;
    let vaultID = internVault.starkKey.toHexString();
    let vault = Vault.load(vaultID);
    if (!vault) {
      vault = new Vault(vaultID);
      vault.starkKey = internVault.starkKey;
    }
    let assetsEntries = internVault.assets.entries;

    for (let x = 0; x < assetsEntries.length; x++) {
      let internAsset = assetsEntries[x].value;
      let tokenID = assetsEntries[x].key.toString();
      let token = Token.load(tokenID);
      if (!token) {
        token = new Token(tokenID);
        token.assetType = internAsset.assetType;
        token.ticker = assetsEntries[x].key.toString();
        token.save();
      }
      //ID Okay?
      let transactionID = memoryPageHashId + ":" + vaultID + ":" + tokenID;
      let transaction = new Transaction(transactionID);
      transaction.amount = internAsset.amount;
      transaction.vault = vaultID;
      transaction.token = tokenID;
      transaction.cachedFundingIndex = internAsset.additionalAttributes.get(
        "cached_funding_index"
      );
      transaction.memoryPageHash = memoryPageHashId;

      let tokenBalanceID = vaultID + ":" + tokenID;
      let tokenBalance = TokenBalance.load(tokenBalanceID);
      if (!tokenBalance) {
        tokenBalance = new TokenBalance(tokenBalanceID);
        tokenBalance.vault = vaultID;
        tokenBalance.token = tokenID;
        tokenBalance.balance = new BigDecimal(new BigInt(0));
      }

      tokenBalance.balance = tokenBalance.balance.plus(internAsset.amount);

      transaction.save();
      tokenBalance.save();
    }
    vault.save();
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

  let addressString = event.params.initializer.toHexString();
  addressString = addressString.substring(addressString.length - 42);
  let charCntr = 0;
  while (addressString[charCntr] == "0") {
    charCntr++;
  }
  addressString = addressString.substring(charCntr);
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
