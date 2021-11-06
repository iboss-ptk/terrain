import {
  BlockTxBroadcastResult,
  Coins,
  CreateTxOptions,
  LCDClient,
  LCDClientConfig,
  MsgExecuteContract,
  Wallet,
} from "@terra-money/terra.js";
import { ContractRef } from "../config";

export type ContractRefs = { [contractName: string]: ContractRef };
export class LCDClientExtra extends LCDClient {
  refs: ContractRefs;

  constructor(config: LCDClientConfig, refs: ContractRefs) {
    super(config);
    this.refs = refs;
  }

  query(contract: string, msg: Object, instanceId = "default") {
    return this.wasm.contractQuery(
      this.refs[contract].contractAddresses[instanceId],
      msg
    );
  }

  async execute(
    wallet: Wallet,
    contract: string,
    msg: Object,
    coins?: Coins.Input,
    options?: CreateTxOptions,
    instanceId = "default"
  ): Promise<BlockTxBroadcastResult> {
    const msgs = [
      new MsgExecuteContract(
        wallet.key.accAddress,
        this.refs[contract].contractAddresses[instanceId],
        msg,
        coins
      ),
    ];
    const _options = options ? { ...options, msgs } : { msgs };
    const tx = await wallet.createAndSignTx(_options);
    return await this.tx.broadcast(tx);
  }
}
