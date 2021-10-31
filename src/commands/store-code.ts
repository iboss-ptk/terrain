import { Command, flags } from "@oclif/command";
import { LCDClient } from "@terra-money/terra.js";
import { loadConfig, loadConnections } from "../config";
import { storeCode } from "../lib/deployment";
import { getSigner } from "../lib/signer";

export default class StoreCode extends Command {
  static description = "store code on chain";

  static flags = {
    "no-rebuild": flags.boolean({ default: false }),
    network: flags.string({ default: "localterra" }),
    "config-path": flags.string({ default: "./config.terrain.json" }),
    "refs-path": flags.string({ default: "./refs.terrain.json" }),
    "keys-path": flags.string({ default: "./keys.terrain.js" }),
    signer: flags.string({ required: true }),
  };

  static args = [{ name: "contract", required: true }];

  async run() {
    const { args, flags } = this.parse(StoreCode);

    const connections = loadConnections(flags["config-path"]);
    const config = loadConfig(flags["config-path"]);
    const conf = config(flags.network, args.contract);

    // @ts-ignore
    const lcd = new LCDClient(connections(flags.network));
    const signer = getSigner({
      network: flags.network,
      signerId: flags.signer,
      keysPath: flags["keys-path"],
      lcd,
    });

    await storeCode({
      conf,
      noRebuild: flags["no-rebuild"],
      contract: args.contract,
      signer,
      network: flags.network,
      refsPath: flags["refs-path"],
      lcd: lcd,
    });
  }
}
