import { Command, flags } from "@oclif/command";
import { execSync } from "child_process";
import * as fs from "fs-extra";
import * as request from "superagent";
import * as Zip from "adm-zip";
import cli from "cli-ux";

export default class New extends Command {
  static description = "create new dapp from template";

  static examples = [
    "$ terrain new awesome-dapp",
    "$ terrain new awesome-dapp --path path/to/dapp",
  ];

  static flags = {
    path: flags.string({ description: "path to keep the project" }),
  };

  static args = [{ name: "name", required: true }];

  async run() {
    const { args, flags } = this.parse(New);

    cli.log("generating: ");
    cli.action.start("- contract");

    if (flags.path) {
      process.chdir(flags.path);
    }

    fs.mkdirSync(args.name);
    process.chdir(args.name);

    fs.mkdirSync("contracts");
    process.chdir("contracts");

    execSync(
      `cargo generate --git https://github.com/CosmWasm/cw-template.git --branch 0.16 --name ${args.name}`
    );

    cli.action.stop();

    process.chdir("..");

    cli.action.start("- frontend");
    const file = fs.createWriteStream("frontend.zip");

    await new Promise((resolve, reject) => {
      request
        .get(
          "https://github.com/iboss-ptk/terrain-frontend-template/archive/refs/heads/main.zip"
        )
        .on("error", (error) => {
          reject(error);
        })
        .pipe(file)
        .on("finish", function () {
          cli.action.stop();
          resolve(null);
        });
    });

    const zip = new Zip("frontend.zip");
    zip.extractAllTo(".", true);
    fs.renameSync("terrain-frontend-template-main", "frontend");
    fs.removeSync("frontend.zip");

    fs.copyFileSync(
      `${__dirname}/../config-template/config.terrain.json`,
      "./config.terrain.json"
    );
  }
}
