import { Command } from "@oclif/command";
import { cli } from "cli-ux";
import { copyFileSync } from "fs-extra";
import * as path from "path";

export default class TaskNew extends Command {
  static description = "create new task";

  static flags = {};

  static args = [{ name: "task" }];

  async run() {
    const { args, flags } = this.parse(TaskNew);

    cli.action.start(`Creating task: ${args.task}`);
    copyFileSync(
      path.join(__dirname, "..", "..", "template", "tasks", "template.js"),
      path.join(process.cwd(), "tasks", `${args.task}.js`)
    );
    cli.action.stop();
  }
}
