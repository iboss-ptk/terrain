import { Command, flags } from "@oclif/command";
import * as path from "path";
import * as childProcess from "child_process";
import { cli } from "cli-ux";
import { Env, getEnv } from "../../lib/env";

export const task = async (fn: (env: Env) => Promise<void>) => {
  try {
    await fn(
      getEnv(
        process.env.configPath || "",
        process.env.keysPath || "",
        process.env.refsPath || "",
        process.env.network || ""
      )
    );
  } catch (err) {
    if (err instanceof Error) {
      cli.error(err);
    }
    if (typeof err === "string") {
      cli.error(err);
    }

    cli.error(`${err}`);
  }
};

export default class Run extends Command {
  static description = "run predefined task";

  static flags = {
    network: flags.string({ default: "localterra" }),
    "config-path": flags.string({ default: "config.terrain.json" }),
    "refs-path": flags.string({ default: "refs.terrain.json" }),
    "keys-path": flags.string({ default: "keys.terrain.js" }),
  };

  static args = [{ name: "task" }];

  async run() {
    const { args, flags } = this.parse(Run);
    const fromCwd = (p: string) => path.join(process.cwd(), p);

    runScript(
      fromCwd(`tasks/${args.task}.js`),
      {
        configPath: fromCwd(flags["config-path"]),
        keysPath: fromCwd(flags["keys-path"]),
        refsPath: fromCwd(flags["refs-path"]),
        network: flags.network,
      },
      (err) => {
        if (err) throw err;
      }
    );
  }
}

function runScript(
  scriptPath: string,
  env: {
    configPath: string;
    keysPath: string;
    refsPath: string;
    network: string;
  },
  callback: (err?: Error) => void
) {
  // keep track of whether callback has been invoked to prevent multiple invocations
  let invoked = false;

  const cProcess = childProcess.fork(scriptPath, { env });

  // listen for errors as they may prevent the exit event from firing
  cProcess.on("error", function (err) {
    if (invoked) return;
    invoked = true;
    callback(err);
  });

  // execute the callback once the process has finished running
  cProcess.on("exit", function (code) {
    if (invoked) return;
    invoked = true;
    const err = code === 0 ? undefined : new Error("exit code " + code);
    callback(err);
  });
}
