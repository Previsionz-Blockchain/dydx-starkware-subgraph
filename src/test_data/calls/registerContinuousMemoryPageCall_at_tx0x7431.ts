import { ethereum, BigInt } from "@graphprotocol/graph-ts";
import { RegisterContinuousMemoryPageCall } from "../../../generated/MemoryPageFactRegistry/MemoryPageFactRegistry";
import { ADDRESSES } from "../constants";
import { block_12504768 } from "../blocks/block_12504768";
import { tx_0xaeef } from "../transactions/tx_0xaeef";
import { batchOnChainData3 } from "../batchOnChainData";
import { tx_0x7431 } from "../transactions/tx_0x7431";

let inputValues: ethereum.EventParam[] = new Array<ethereum.EventParam>();

inputValues.push(
  new ethereum.EventParam(
    "startAddr",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString("13767862"))
  )
);

inputValues.push(
  new ethereum.EventParam(
    "values",
    ethereum.Value.fromUnsignedBigIntArray(batchOnChainData3)
  )
);

inputValues.push(
  new ethereum.EventParam(
    "z",
    ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(
        "227200206119168001493339315413225180776931398740529232608594469021612113096"
      )
    )
  )
);
inputValues.push(
  new ethereum.EventParam(
    "alpha",
    ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(
        "1787907482623567322245024051979877596550791148104953454449337286682421634300"
      )
    )
  )
);
inputValues.push(
  new ethereum.EventParam(
    "prime",
    ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(
        "3618502788666131213697322783095070105623107215331596699973092056135872020481"
      )
    )
  )
);

let outputValues: ethereum.EventParam[] = new Array<ethereum.EventParam>();

export let registerContinuousMemoryPageCall_at_tx0x7431: RegisterContinuousMemoryPageCall = new RegisterContinuousMemoryPageCall(
  ADDRESSES.get("dYdX: Memory Page Fact Registry"),
  ADDRESSES.get("dYdX: L2 On-Chain Operator"),
  block_12504768,
  tx_0x7431,
  inputValues,
  outputValues
);
