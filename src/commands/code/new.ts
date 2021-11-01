import { Command, flags } from "@oclif/command";
import { execSync } from "child_process";
import { cli } from "cli-ux";

export default class New extends Command {
  static description = "generate new contract";

  static flags = {
    path: flags.string({
      description: "path to keep the contracts",
      default: "./contracts",
    }),
    version: flags.string({
      default: "0.16",
    }),
  };

  static args = [{ name: "name" }];

  async run() {
    const { args, flags } = this.parse(New);

    process.chdir(flags.path);

    cli.action.start("generating contract");
    execSync(
      `cargo generate --git https://github.com/CosmWasm/cw-template.git --branch ${flags.version} --name ${args.name}`
    );

    cli.action.stop();
  }
}
