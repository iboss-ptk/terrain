import { Command, flags } from "@oclif/command";
import { LCDClient } from "@terra-money/terra.js";
import { loadConfig, loadConnections, loadRefs } from "../../config";
import { migrate } from "../../lib/deployment";
import { getSigner } from "../../lib/signer";

export default class ContractMigrate extends Command {
  static description = "describe the command here";

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
  };

  static args = [{ name: "contract" }];

  async run() {
    const { args, flags } = this.parse(ContractMigrate);

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

    console.log(loadRefs(flags["refs-path"])[flags.network][args.contract]);
    const codeId =
      flags["code-id"] ||
      loadRefs(flags["refs-path"])[flags.network][args.contract].codeId;

    migrate({
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
