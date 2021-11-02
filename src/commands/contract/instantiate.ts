import { Command, flags } from "@oclif/command";
import { LCDClient } from "@terra-money/terra.js";
import { loadConfig, loadConnections, loadRefs } from "../../config";
import { instantiate } from "../../lib/deployment";
import { getSigner } from "../../lib/signer";

export default class ContractInstantiate extends Command {
  static description = "instantiate contract";

  static flags = {
    network: flags.string({ default: "localterra" }),
    "config-path": flags.string({ default: "./config.terrain.json" }),
    "refs-path": flags.string({ default: "./refs.terrain.json" }),
    "keys-path": flags.string({ default: "./keys.terrain.js" }),
    "instance-id": flags.string({ default: "default" }),
    signer: flags.string({ required: true }),
    "code-id": flags.integer({
      description:
        "target code id for migration, can do only once after columbus-5 upgrade",
    }),
    "set-signer-as-admin": flags.boolean({ default: false }),
  };

  static args = [{ name: "contract", required: true }];

  async run() {
    const { args, flags } = this.parse(ContractInstantiate);

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

    const codeId =
      flags["code-id"] ||
      loadRefs(flags["refs-path"])[flags.network][args.contract].codeId;

    const admin = flags["set-signer-as-admin"]
      ? signer.key.accAddress
      : undefined;

    instantiate({
      conf,
      signer,
      admin,
      contract: args.contract,
      codeId,
      network: flags.network,
      instanceId: flags["instance-id"],
      refsPath: flags["refs-path"],
      lcd: lcd,
    });
  }
}
