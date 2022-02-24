import { Bytes, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ADDRESSES } from "../constants";

export const tx_0xf248 = new ethereum.Transaction(
  // public hash: Bytes,
  Bytes.fromHexString(
    "0xf248f82e85430f82fb73adf5f4a51acb86c285efa6d07abb2af4dd601e8edaf4"
  ) as Bytes,
  // public index: BigInt,
  BigInt.fromI32(0),
  // public from: dummy Address
  ADDRESSES.get("dYdX: RegisteredUser"),
  // public to: Address | null,
  ADDRESSES.get("dYdX: L2 Perpetual Smart Contract"),
  // public value: BigInt,
  BigInt.fromI32(0),
  // public gasLimit: BigInt,
  BigInt.fromI32(5000000),
  // public gasPrice: BigInt,
  BigInt.fromString("45000000000"),
  // public input: Bytes
  Bytes.fromHexString("0xd528058900000000000000000000000075327e1bfd84fe960db3b1bde4bfcf41a8a12b10066f6d9edb30a0b73ab983b6e852a747fe6c2a653c5d4ea14355406d6349afcb00000000000000000000000000000000000000000000000000000000000000c002893294412a4c8f915f75892b395ebbf6859ec246ec365c3b1f56f47c3a0a5d0000000000000000000000000000000000000000000000000000000000026d5e00000000000000000000000000000000000000000000000000000000993db457000000000000000000000000000000000000000000000000000000000000004182281249c69a8be93557718db2cc78714b828291172276ecd53968cb5aded4ea08d666a7163eed2c9fde3bd2dcb3fc9485cc08ac03b6cf06ba4934c195a50cd91c00000000000000000000000000000000000000000000000000000000000000") as Bytes
);
