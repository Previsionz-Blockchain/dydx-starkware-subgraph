import { Address, Bytes } from "@graphprotocol/graph-ts";
import { IAddresses } from "../mapping.test";

export const ADDRESSES: IAddresses = {
  Ethermine: Address.fromString("0xea674fdde714fd979de3edf0f56aa9716b898ec8"),
  "dYdX: L2 On-Chain Operator": Address.fromString(
    "0x8129b737912e17212c8693b781928f5d0303390a"
  ),
  "dydx: GPS Statement Verifier": Address.fromString(
    "0xc8c212f11f6acca77a7afeb7282deba5530eb46c"
  ),
  "dYdX: Memory Page Fact Registry": Address.fromString(
    "0xefbcce4659db72ec6897f46783303708cf9acef8"
  ),
};

export const UNKNOWN_BYTES = Bytes.fromHexString(
  "0x0000000000000000000000000000000000000000000000000000000000000000"
);
