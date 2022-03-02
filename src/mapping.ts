import { Address, log, BigInt, BigDecimal, ethereum } from "@graphprotocol/graph-ts";

import { LogStateTransitionFact, RegisterAndDepositERC20Call, RegisterUserCall } from "../generated/StarkPerpetual/StarkPerpetual";
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
  Asset,
  VaultHistory,
  dailyVolume,
  User,
  dailyVolumeAsset
} from "../generated/schema";
import { GpsStatementVerifier } from "../generated/templates";
import { parseOnChainData, dumpOnChainData } from "./parseOnChainData";

export { runTests } from "./mapping.test";

function hexZeroPad(hexstring: string, length: i32 = 32): string {
  return hexstring.substr(0, 2) + hexstring.substr(2).padStart(length * 2, "0");
}

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

export function handleLogMemoryPagesHashes(event: LogMemoryPagesHashes): void {

  let timestamp = event.block.timestamp.toI32()
  let day = timestamp / 86400 
  let dayID = day.toString()
  let dailyVolumes = dailyVolume.load(dayID)
  if(!dailyVolumes){
    dailyVolumes = new dailyVolume(dayID)
  }

  let blockHash = event.block.hash.toHexString();
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

  // key = ticker, value = accumulated volume of a rollup
  let assetvalue = new Map<String, BigDecimal>()

  for (let i = 0; i < dumpedData.length; i++) {
    let positionId = dumpedData[i].key;
    let internVault = dumpedData[i].value;
    let starkKey = internVault.starkKey.toHexString();

    let vaultHistoryId = positionId.toString();
    let vaultHistory = VaultHistory.load(vaultHistoryId);
    if (!vaultHistory) {
      vaultHistory = new VaultHistory(vaultHistoryId);
      vaultHistory.user = starkKey
    }

    let blockHashVaultId = vaultHistoryId + ":" + blockHash;
    let vault = new Vault(blockHashVaultId);
    vault.positionID = BigInt.fromString(positionId.toString());
    vault.starkKey = starkKey;
    vault.memoryPageHash = memoryPageHashId;

    let assetsEntries = internVault.assets.entries;
    for (let x = 0; x < assetsEntries.length; x++) {
      let ticker = assetsEntries[x].key.toString();
      let internAsset = assetsEntries[x].value;
      let assetId = blockHashVaultId + ":" + ticker;
      let asset = new Asset(assetId);
      asset.amount = internAsset.amount;
      asset.assetType = internAsset.assetType;
      
      let zero = BigInt.fromI32(0)
      let zeroDec = new BigDecimal(zero)

      let minusOne = BigInt.fromI32(-1)
      let minusOneDec = new BigDecimal(minusOne)
      //storing values in mapping
      if(assetvalue.has(ticker) == false){
        if(internAsset.amount.lt(zeroDec)){
          let posAmount = internAsset.amount.times(minusOneDec)
          assetvalue.set(ticker, posAmount)
        }
        else{assetvalue.set(ticker, internAsset.amount)}
      }
      else{
        let keysvalue = assetvalue.get(ticker)
        if(internAsset.amount.lt(zeroDec)){
          let posAmount = internAsset.amount.times(minusOneDec)
          keysvalue = keysvalue.plus(posAmount)
          
        }
        else{
          keysvalue = keysvalue.plus(internAsset.amount)
        }
        assetvalue.set(ticker, keysvalue)

        let dailyVolumeAssetID = dayID.toString().concat('-').concat(ticker)
        asset.dailyVolumeAsset = dailyVolumeAssetID
      }

      asset.cachedFundingIndex = internAsset.additionalAttributes.get(
        "cached_funding_index"
      );
      asset.vault = blockHashVaultId;
      asset.ticker = ticker;
      asset.save();
    }
    vault.vaultHistory = vaultHistoryId;
    vault.save();
    vaultHistory.latestVault = blockHashVaultId;
    vaultHistory.save();
  }

  let assetvalueKeys = assetvalue.keys()
  for (let i = 0; i < assetvalueKeys.length; i++){
    let key = assetvalueKeys[i]
    let value = assetvalue.get(key)
    let dailyVolumeAssetID = dayID.toString().concat('-').concat(key)
    let dailyVolumeAssets = dailyVolumeAsset.load(dailyVolumeAssetID)

    if(!dailyVolumeAssets){
      dailyVolumeAssets = new dailyVolumeAsset(dailyVolumeAssetID)
      dailyVolumeAssets.asset = key.toString()
      dailyVolumeAssets.amount = value
      dailyVolumeAssets.day = dayID
    }
    else{
      dailyVolumeAssets.amount = dailyVolumeAssets.amount.plus(value)
      
    }
    dailyVolumeAssets.save()
  }
  dailyVolumes.save()
  
  entity.memoryPageFacts = memoryPageFacts;
  entity.save();
}

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


export function handleRegisterUser(call: RegisterUserCall): void{
  registerUser(call,call.inputs.ethKey,call.inputs.starkKey.toHexString())
}

export function handleRegisterAndDeposit(call: RegisterAndDepositERC20Call): void{
  registerUser(call,call.inputs.ethKey,call.inputs.starkKey.toHexString())
}

function registerUser(call: ethereum.Call, ethKey: Address, starkKey: string): void{
  let entity = new User(starkKey)
  entity.blockHash = call.block.hash
  entity.blockNumber = call.block.number
  entity.timestamp = call.block.timestamp
  entity.transactionHash = call.transaction.hash

  entity.ethKey = ethKey
  entity.starkKey = starkKey
  entity.save()
}