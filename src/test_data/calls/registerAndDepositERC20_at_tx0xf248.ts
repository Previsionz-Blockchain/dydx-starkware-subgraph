import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import { ADDRESSES } from "../constants";
import { block_12504768 } from "../blocks/block_12504768";
import { tx_0xf248 } from "../transactions/tx_0xf248";
import { RegisterAndDepositERC20Call } from "../../../generated/StarkPerpetual/StarkPerpetual";

let inputValues: ethereum.EventParam[] = new Array<ethereum.EventParam>();

inputValues.push(
  new ethereum.EventParam(
    "ethKey",
    ethereum.Value.fromAddress(Address.fromString("0x75327e1bfD84fE960DB3b1bDe4BfCf41a8A12b10"))
  )
);

inputValues.push(
  new ethereum.EventParam(
    "starkKey",
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString("2910753688796768762416110924910876245295886396099744342914273456898601234379"))
  )
);

inputValues.push(
  new ethereum.EventParam(
    "signature",
    ethereum.Value.fromBytes(Bytes.fromHexString("0x82281249c69a8be93557718db2cc78714b828291172276ecd53968cb5aded4ea08d666a7163eed2c9fde3bd2dcb3fc9485cc08ac03b6cf06ba4934c195a50cd91c") as Bytes)
  )
);
inputValues.push(
  new ethereum.EventParam(
    "assetType",
    ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(
        "1147032829293317481173155891309375254605214077236177772270270553197624560221"
      )
    )
  )
);

inputValues.push(
  new ethereum.EventParam(
    "vaultId",
    ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(
        "159070"
      )
    )
  )
);

inputValues.push(
  new ethereum.EventParam(
    "quantizedAmount",
    ethereum.Value.fromUnsignedBigInt(
      BigInt.fromString(
        "2570957911"
      )
    )
  )
);

let outputValues: ethereum.EventParam[] = new Array<ethereum.EventParam>();

export let registerAndDepositERC20_at_tx0xf248: RegisterAndDepositERC20Call = new RegisterAndDepositERC20Call(
  ADDRESSES.get("dYdX: RegisteredUser"),
  ADDRESSES.get("dYdX: L2 Perpetual Smart Contract"),
  block_12504768, //keeping the default block
  tx_0xf248,
  inputValues,
  outputValues
);
