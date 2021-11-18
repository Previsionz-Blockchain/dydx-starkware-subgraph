import {
  TypedMap,
  BigInt,
  Bytes,
  ByteArray,
  BigDecimal,
  log,
} from "@graphprotocol/graph-ts";



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
export class PositionStateUpdate {
  positionId: BigInt;
  publicKey: BigInt;
  collateralBalance: BigInt;
  fundingTimestamp: BigInt;
  assetBalanceUpdates: TypedMap<BigInt, BigInt>;
  constructor(
    positionId: BigInt,
    publicKey: BigInt,
    collateralBalance: BigInt,
    fundingTimestamp: BigInt,
    assetBalanceUpdates: TypedMap<BigInt, BigInt>
  ) {
    this.positionId = positionId;
    this.publicKey = publicKey;
    this.collateralBalance = collateralBalance;
    this.fundingTimestamp = fundingTimestamp;
    this.assetBalanceUpdates = assetBalanceUpdates;
  }
}

/*
  Dataclass for storing the onchain data.
  */
class PerpetualOnChainData {
  fundingIndicesMapping: TypedMap<i32, FundingIndicesState>;
  updates: PositionStateUpdate[];
  unparsedValues: BigInt[];

  constructor(
    fundingIndicesMapping: TypedMap<i32, FundingIndicesState>,
    updates: PositionStateUpdate[],
    unparsedValues: BigInt[]
  ) {
    this.fundingIndicesMapping = fundingIndicesMapping;
    this.updates = updates;
    this.unparsedValues = unparsedValues;
  }
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
  constructor(starkKey: BigInt, assets: TypedMap<String, VaultAsset>) {
    this.starkKey = starkKey;
    this.assets = assets;
  }
}

function getAssetIdsAndBalances(
  serializedAssets: BigInt[]
): TypedMap<BigInt, BigInt> {
  let assetIdsAndBalanced = new TypedMap<BigInt, BigInt>();

  for (let i = 0; i < serializedAssets.length; i++) {
    let assetSerialized = serializedAssets[i];
    let assetId = changetype<BigInt>(assetSerialized.subarray(8));
    let biasedBalance = changetype<BigInt>(assetSerialized.subarray(0, 16));

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
  let positionId = data[0];
  let publicKey = data[1];
  let biasedBalance = data[2].plus(FUNDING_INDEX_LOWER_BOUND);
  let fundingTimestamp = data[3];
  let assetSerialization = getAssetIdsAndBalances(data.slice(4));
  let positionStateUpdate = new PositionStateUpdate(
    positionId,
    publicKey,
    biasedBalance,
    fundingTimestamp,
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

export function parseOnChainData(_values: BigInt[]): PerpetualOnChainData {
  let fundingIndicesTableSize = _values[0].toI32();
  let values = _values.slice(1);
  let fundingIndicesMapping = new TypedMap<i32, FundingIndicesState>();

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

  let positionStateUpdates = createPositionStateUpdates(values);

  return new PerpetualOnChainData(
    fundingIndicesMapping,
    positionStateUpdates,
    values
  );
}

/**
 *
 * @param values This function will modify the array! There might be leftover values at the end of execution
 * @returns
 */
export function createPositionStateUpdates(
  values: BigInt[]
): PositionStateUpdate[] {
  let positionStateUpdates = new Array<PositionStateUpdate>();
  while (values.length > 0) {
    let currentPositionStateValues = values.shift();

    let spliceLength = currentPositionStateValues.toI32();
    if (values.length < spliceLength) {
      log.debug(
        "Missing values {} < {}: parsePositionStateUpdate will continue with next tx",
        [values.length.toString(), spliceLength.toString()]
      );
      values.unshift(currentPositionStateValues);
      break;
    }
    let positionElements = values.splice(0, spliceLength);
    positionStateUpdates.push(parsePositionStateUpdate(positionElements));

    log.debug(
      "add positionStateUpdate: " +
        currentPositionStateValues.toString() +
        " " +
        BigInt.fromI32(values.length).toString(),
      []
    );
  }
  return positionStateUpdates;
}

export function dumpOnChainData(
  positionStateUpdates: PositionStateUpdate[]
): TypedMap<String, Vault> {
  let result = new TypedMap<String, Vault>();

  for (let i = 0; i < positionStateUpdates.length; i++) {
    let update = positionStateUpdates[i];
    let vault = dumpPositionUpdate(update);
    result.set(update.positionId.toString(), vault);
  }

  return result;
}

function dumpPositionUpdate(update: PositionStateUpdate): Vault {
  let starkKey = update.publicKey;
  let assets = dumpPositionUpdateAssets(update);
  let vault = new Vault(starkKey, assets);
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

    let assetInfo = assetId.toHexString();
    //   Graph fails to parse if assetId = 0x0 (e.g. Block 12115229)
    let assetName = "N/A";
    let resolution = new BigInt(0);
    if (assetInfo != "0x0") {
      assetInfo = ByteArray.fromHexString(assetId.toHexString()).toString();
      let assetInfoSplit = assetInfo.split("-");
      assetName = assetInfoSplit[0];
      resolution = BigInt.fromString(assetInfoSplit[1]);
    }
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

// export function runTests(): void {
//   test("parseOnChainData", () => {
//     let parsedOnChainData = parseOnChainData(batchOnChainData);
//     let positionStateUpdate = dumpOnChainData(parsedOnChainData);

//     // let lower = BigInt.fromI32(0).minus(BigInt.fromI32(2).pow(63));

//     log.info("End!" + FUNDING_INDEX_LOWER_BOUND.toString(), []);
//   });
// }
