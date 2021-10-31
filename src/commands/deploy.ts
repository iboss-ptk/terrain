import { Command, flags } from "@oclif/command";
import { LCDClient, LocalTerra, Wallet } from "@terra-money/terra.js";
import { loadConfig, loadConnections, loadKeys } from "../config";
import { instantiate, storeCode } from "../lib/deploy";
import * as path from "path";
import { cli } from "cli-ux";

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

    const lcdClientConfig = loadConnections(flags["config-path"]);
    const config = loadConfig(flags["config-path"]);
    const conf = config(flags.network, args.contract);

    // @ts-ignore
    const terra = new LCDClient(lcdClientConfig(flags.network));

    let signer: Wallet;

    const localterra = new LocalTerra();
    if (
      flags.network === "localterra" &&
      flags.signer &&
      localterra.wallets.hasOwnProperty(flags.signer)
    ) {
      cli.log(
        `using pre-baked '${flags.signer}' wallet on localterra as signer`
      );
      // @ts-ignore
      signer = localterra.wallets[flags.signer];
    } else {
      const keys = loadKeys(path.join(process.cwd(), flags["keys-path"]));

      if (!keys[flags.signer]) {
        cli.error(`key for '${flags.signer}' does not exists.`);
      }

      signer = new Wallet(terra, keys[flags.signer]);
    }

    const codeId = await storeCode({
      conf,
      noRebuild: flags["no-rebuild"],
      contract: args.contract,
      signer,
      network: flags.network,
      refsPath: flags["refs-path"],
      lcd: terra,
    });

    instantiate({
      conf,
      signer,
      contract: args.contract,
      codeId,
      network: flags.network,
      instanceId: flags["instance-id"],
      refsPath: flags["refs-path"],
      lcd: terra,
    });
  }
}
