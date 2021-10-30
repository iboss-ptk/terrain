import { Command, flags } from "@oclif/command";
import {
  Fee,
  LocalTerra,
  MsgInstantiateContract,
  Wallet,
} from "@terra-money/terra.js";
import { cli } from "cli-ux";
import { ContractConfig, loadConfig, saveConfig } from "../config";
import { instantiate, storeCode } from "../lib/deploy";

// TODO: depends on configuration
const terra = new LocalTerra();

export default class Deploy extends Command {
  static description = "store code on chain and instantiate";

  static flags = {
    "no-rebuild": flags.boolean({ default: false }),
    network: flags.string({ default: "localterra" }),
    config: flags.string({ default: "./config.terrain.json" }),
    "instance-id": flags.string({ default: "default" }),
  };

  static args = [{ name: "contract", required: true }];

  async run() {
    const { args, flags } = this.parse(Deploy);

    const config = loadConfig(flags.config);

    const conf = config(flags.network, args.contract);

    const signer = terra.wallets.validator;

    const codeId = await storeCode({
      conf,
      noRebuild: flags["no-rebuild"],
      contract: args.contract,
      signer,
      network: flags.network,
      configPath: flags.config,
      lcd: terra,
    });

    // TODO: only allow snake case validation (also in new)
    // config file: admin, signer,

    instantiate({
      conf,
      signer,
      contract: args.contract,
      codeId,
      network: flags.network,
      instanceId: flags["instance-id"],
      configPath: flags.config,
      lcd: terra,
    });
  }
}
