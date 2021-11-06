import { Command, flags } from "@oclif/command";
import { LocalTerra, RawKey, Wallet } from "@terra-money/terra.js";
import {
  ContractConfig,
  loadConfig,
  loadConnections,
  loadKeys,
  loadRefs,
  ContractRef,
} from "../../config";
import * as R from "ramda";
import * as path from "path";
import * as childProcess from "child_process";
import { cli } from "cli-ux";
import { LCDClientExtra } from "../../lib/LCDClientExtra";

export type Env = {
  config: (contract: string) => ContractConfig;
  refs: { [contractName: string]: ContractRef };
  wallets: { [key: string]: Wallet };
  client: LCDClientExtra;
};

const getEnv = (
  configPath: string,
  keysPath: string,
  refsPath: string,
  network: string
): Env => {
  const connections = loadConnections(configPath);
  const config = loadConfig(configPath);

  const keys = loadKeys(keysPath);
  const refs = loadRefs(refsPath)[network];

  const lcd = new LCDClientExtra(connections(network), refs);

  const userDefinedWallets = R.map<
    { [k: string]: RawKey },
    { [k: string]: Wallet }
  >((k) => new Wallet(lcd, k), keys);

  return {
    config: (contract) => config(network, contract),
    refs,
    wallets: {
      ...new LocalTerra().wallets,
      ...userDefinedWallets,
    },
    client: lcd,
  };
};

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
  static description = "describe the command here";

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

    const env = getEnv(
      fromCwd(flags["config-path"]),
      fromCwd(flags["keys-path"]),
      fromCwd(flags["refs-path"]),
      flags.network
    );

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
