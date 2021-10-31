import { Command, flags } from "@oclif/command";
import { LCDClient } from "@terra-money/terra.js";
import { loadConfig, loadConnections } from "../config";
import { instantiate, storeCode } from "../lib/deploy";
import { getSigner } from "../lib/signer";

export default class Deploy extends Command {
  static description = "store code on chain and instantiate";

  static flags = {
    "no-rebuild": flags.boolean({ default: false }),
    network: flags.string({ default: "localterra" }),
    "config-path": flags.string({ default: "./config.terrain.json" }),
    "refs-path": flags.string({ default: "./refs.terrain.json" }),
    "keys-path": flags.string({ default: "./keys.terrain.js" }),
    "instance-id": flags.string({ default: "default" }),
    signer: flags.string({ required: true }),
  };

  static args = [{ name: "contract", required: true }];

  async run() {
    const { args, flags } = this.parse(Deploy);

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

    const codeId = await storeCode({
      conf,
      noRebuild: flags["no-rebuild"],
      contract: args.contract,
      signer,
      network: flags.network,
      refsPath: flags["refs-path"],
      lcd: lcd,
    });

    instantiate({
      conf,
      signer,
      contract: args.contract,
      codeId,
      network: flags.network,
      instanceId: flags["instance-id"],
      refsPath: flags["refs-path"],
      lcd: lcd,
    });
  }
}
