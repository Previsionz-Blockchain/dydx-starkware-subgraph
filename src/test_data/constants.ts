import { Address, Bytes } from "@graphprotocol/graph-ts";

export let ADDRESSES = new Map<string, Address>();

ADDRESSES.set(
  "Ethermine",
  Address.fromString("0xea674fdde714fd979de3edf0f56aa9716b898ec8")
);
ADDRESSES.set(
  "dYdX: L2 On-Chain Operator",
  Address.fromString("0x8129b737912e17212c8693b781928f5d0303390a")
);
ADDRESSES.set(
  "dydx: GPS Statement Verifier",
  Address.fromString("0xc8c212f11f6acca77a7afeb7282deba5530eb46c")
);
ADDRESSES.set(
  "dYdX: Memory Page Fact Registry",
  Address.fromString("0xefbcce4659db72ec6897f46783303708cf9acef8")
);
ADDRESSES.set(
  "dYdX: L2 Perpetual Smart Contract",
  Address.fromString("0xd54f502e184b6b739d7d27a6410a67dc462d69c8")
);
ADDRESSES.set(
  "dYdX: RegisteredUser",
  Address.fromString("0x75327e1bfD84fE960DB3b1bDe4BfCf41a8A12b10")
)

export const UNKNOWN_BYTES = Bytes.fromHexString(
  "0x0000000000000000000000000000000000000000000000000000000000000000"
) as Bytes;
