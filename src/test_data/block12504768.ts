import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { ADDRESSES, UNKNOWN_BYTES } from "./constants";

export let block12504768 = new ethereum.Block(
  // hash
  Bytes.fromHexString(
    "0x46c212912be05a090a9300cf87fd9434b8e8bbca15878d070ba83375a5dbaebd"
  ) as Bytes,
  // parentHash
  Bytes.fromHexString(
    "0xaa2f6d8f5ac2fbd29bc8c6c06af6626d1ea48214915ff7eb092ede593859d57e"
  ) as Bytes,
  // unclesHash
  Bytes.fromHexString(
    "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347"
  ) as Bytes,
  // author
  ADDRESSES.get("Ethermine"),
  // stateRoot
  Bytes.fromHexString(
    "0x0e44b1b633ea9a094fe34402249f3b6ae5ef414e491d94a0bb1225b554006080"
  ) as Bytes,
  // transactionsRoot
  UNKNOWN_BYTES,
  // receiptRoot
  UNKNOWN_BYTES,
  // number
  BigInt.fromI32(12504768),
  // gasUsed
  BigInt.fromI32(14969193),
  // gasLimit
  BigInt.fromI32(14985338),
  // timestamp
  BigInt.fromI32(1621912139),
  // difficulty
  BigInt.fromString("7873232265818527"),
  // totalDifficulty
  BigInt.fromString("25249940481586310089168"),
  // size
  BigInt.fromI32(214223)
);
