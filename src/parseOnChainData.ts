import {
  TypedMap,
  BigInt,
  Bytes,
  ByteArray,
  BigDecimal,
} from "@graphprotocol/graph-ts";
import { test } from "matchstick-as/assembly/index";
import { log } from "matchstick-as/assembly/log";

import { batchOnChainData } from "./test_data/batchOnChainData";

let FUNDING_INDEX_LOWER_BOUND: BigInt = BigInt.fromI32(2)
  .pow(63)
  .neg();
let ONCHAIN_DATA_ASSET_ID_OFFSET: BigInt = BigInt.fromI32(64);
let ASSET_ID_UPPER_BOUND: BigInt = BigInt.fromI32(2).pow(210);
let USDC_RESOLUTION = BigInt.fromI32(10)
  .pow(6)
  .toBigDecimal();

/*
    Represents a collection of timestamped global funding indices for all assets.
  
    :param indices: Map of synthetic asset to its global funding index.
    :type indices: Mapping[int, int]
    :param timestamp: The timestamp for which the funding indices are valid for.
    :type timestamp: int
   */
class FundingIndicesState {
  indices: TypedMap<BigInt, BigInt>;
  timestamp: i32;

  constructor(indices: TypedMap<BigInt, BigInt>, timestamp: i32) {
    this.indices = indices;
    this.timestamp = timestamp;
  }
}

/*
    Holds information about a single position update.
    Members:
      - position_id: the id of the position the update refers to.
      - public_key: the new public key of the position.
      - collateral_balance: the new amount of collateral_balance of the position.
      - funding_timestamp: The timestamp of the last funding that was applied to the position.
      - asset_balance_updates: information regarding the assets that changed in the position
      (contains asset_id and balance)
  */
class PositionStateUpdate {
  positionId: BigInt;
  publicKey: BigInt;
  collateralBalance: BigInt;
  fundingTimestamp: BigInt;
  assetBalanceUpdates: TypedMap<BigInt, BigInt>;
}

/*
  Dataclass for storing the onchain data.
  */
class PerpetualOnChainData {
  fundingIndicesMapping: TypedMap<i32, FundingIndicesState>;
  updates: PositionStateUpdate[];
}

class VaultAsset {
  assetType: string;
  amount: BigDecimal; // can be positive or negative
  additionalAttributes: TypedMap<String, BigInt>;

  constructor(
    assetType: string,
    amount: BigDecimal,
    additionalAttributes: TypedMap<String, BigInt>
  ) {
    this.assetType = assetType;
    this.amount = amount;
    this.additionalAttributes = additionalAttributes;
  }
}

class Vault {
  starkKey: BigInt;
  assets: TypedMap<String, VaultAsset>;
}

function getAssetIdsAndBalances(
  serializedAssets: BigInt[]
): TypedMap<BigInt, BigInt> {
  let assetIdsAndBalanced = new TypedMap<BigInt, BigInt>();

  for (let i = 0; i < serializedAssets.length; i++) {
    let assetSerialized = serializedAssets[i];
    let assetId = assetSerialized.subarray(8) as BigInt;
    let biasedBalance = assetSerialized.subarray(0, 16) as BigInt;

    log.debug(
      "assetSerialized: " +
        assetSerialized.toHexString() +
        " " +
        assetId.toHexString() +
        " " +
        biasedBalance.toHexString(),
      []
    );

    assetIdsAndBalanced.set(
      assetId,
      biasedBalance.plus(FUNDING_INDEX_LOWER_BOUND)
    );
  }

  return assetIdsAndBalanced;
}

function parsePositionStateUpdate(data: BigInt[]): PositionStateUpdate {
  let positionStateUpdate = new PositionStateUpdate();
  positionStateUpdate.positionId = data[0];
  positionStateUpdate.publicKey = data[1];
  let biasedBalance = data[2];
  positionStateUpdate.collateralBalance = biasedBalance.plus(
    FUNDING_INDEX_LOWER_BOUND
  );
  positionStateUpdate.fundingTimestamp = data[3];

  let assetSerialization = data.slice(4);
  positionStateUpdate.assetBalanceUpdates = getAssetIdsAndBalances(
    assetSerialization
  );

  log.debug(
    "parsedPositionStateUpdate: " +
      positionStateUpdate.positionId.toString() +
      ", publicKey:" +
      positionStateUpdate.publicKey.toString() +
      ", collateralBalance:" +
      positionStateUpdate.collateralBalance.toString() +
      ", fundingTimestamp:" +
      positionStateUpdate.fundingTimestamp.toString() +
      ", assetBalanceUpdates:",
    // positionStateUpdate.assetBalanceUpdates.length.toString()
    []
  );

  return positionStateUpdate;
}

function parseOnChainData(_values: BigInt[]): PerpetualOnChainData {
  let fundingIndicesTableSize = _values[0].toI32();
  let values = _values.slice(1);
  let fundingIndicesMapping = new TypedMap<i32, FundingIndicesState>();
  let positionStateUpdates = new Array<PositionStateUpdate>();

  for (let i = 0; i < fundingIndicesTableSize; i++) {
    let numberOfFundingIndices = values[0].toI32();
    let relevantValues = values.slice(1, 2 * numberOfFundingIndices + 1 + 1);
    let timestamp = relevantValues.pop().toI32();
    let indices = new TypedMap<BigInt, BigInt>();

    for (let j = 0; j < numberOfFundingIndices * 2; j += 2) {
      indices.set(
        relevantValues[j],
        relevantValues[j + 1].plus(FUNDING_INDEX_LOWER_BOUND)
      );
      log.debug(
        "Funding index: " +
          relevantValues[j].toString() +
          ": " +
          relevantValues[j + 1].plus(FUNDING_INDEX_LOWER_BOUND).toString(),
        []
      );
    }

    let fundingIndicesState = new FundingIndicesState(indices, timestamp);
    fundingIndicesMapping.set(
      fundingIndicesState.timestamp,
      fundingIndicesState
    );

    values = values.slice(2 * numberOfFundingIndices + 1 + 1);
  }

  log.debug(BigInt.fromI32(values.length).toString(), []);

  while (values.length > 0) {
    let currentPositionStateValues = values[0];

    positionStateUpdates.push(
      parsePositionStateUpdate(
        values.slice(
          1,
          currentPositionStateValues.plus(BigInt.fromI32(1)).toI32()
        )
      )
    );

    log.debug(
      "add positionStateUpdate: " +
        currentPositionStateValues.toString() +
        " " +
        BigInt.fromI32(values.length).toString(),
      []
    ),
      (values = values.slice(
        currentPositionStateValues.plus(BigInt.fromI32(1)).toI32()
      ));
  }

  let onChainData = new PerpetualOnChainData();
  onChainData.fundingIndicesMapping = fundingIndicesMapping;
  onChainData.updates = positionStateUpdates;

  return onChainData;
}

function dumpOnChainData(
  onChainData: PerpetualOnChainData
): TypedMap<String, Vault> {
  let result = new TypedMap<String, Vault>();

  for (let i = 0; i < onChainData.updates.length; i++) {
    let update = onChainData.updates[i];
    let vault = dumpPositionUpdate(update);
    result.set(update.positionId.toString(), vault);
  }

  return result;
}

function dumpPositionUpdate(update: PositionStateUpdate): Vault {
  let vault = new Vault();
  vault.starkKey = update.publicKey;
  vault.assets = dumpPositionUpdateAssets(update);
  return vault;
}

function dumpPositionUpdateAssets(
  update: PositionStateUpdate
): TypedMap<String, VaultAsset> {
  let assetsDict = new TypedMap<String, VaultAsset>();

  assetsDict.set(
    "USDC",
    new VaultAsset(
      "ERC20",
      update.collateralBalance.toBigDecimal().div(USDC_RESOLUTION),
      new TypedMap<String, BigInt>()
    )
  );

  for (let i = 0; i < update.assetBalanceUpdates.entries.length; i++) {
    let entry = update.assetBalanceUpdates.entries[i];
    let assetId = entry.key;
    let amount = entry.value.toBigDecimal();

    let assetInfo = ByteArray.fromHexString(assetId.toHexString()).toString();
    let assetName = assetInfo.split("-")[0];
    let resolution = BigInt.fromString(assetInfo.split("-")[1]);
    let additionalAttributes = new TypedMap<String, BigInt>();

    additionalAttributes.set("cached_funding_index", update.fundingTimestamp);

    assetsDict.set(
      assetName,
      new VaultAsset(
        "SYNTH",
        amount.div(
          BigInt.fromI32(10)
            .pow(resolution.toI32() as u8)
            .toBigDecimal()
        ),
        additionalAttributes
      )
    );

    log.debug(
      "assetBalanceUpdate: " +
        assetName +
        " " +
        amount
          .div(
            BigInt.fromI32(10)
              .pow(resolution.toI32() as u8)
              .toBigDecimal()
          )
          .toString() +
        " " +
        update.fundingTimestamp.toString(),
      []
    );
  }

  return assetsDict;
}

export function runTests(): void {
  test("parseOnChainData", () => {
    let parsedOnChainData = parseOnChainData(batchOnChainData);
    let positionStateUpdate = dumpOnChainData(parsedOnChainData);

    // let lower = BigInt.fromI32(0).minus(BigInt.fromI32(2).pow(63));

    log.info("End!" + FUNDING_INDEX_LOWER_BOUND.toString(), []);
  });
}
