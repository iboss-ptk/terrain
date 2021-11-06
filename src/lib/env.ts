import { LocalTerra, RawKey, Wallet } from "@terra-money/terra.js";
import {
  ContractConfig,
  ContractRef,
  loadConfig,
  loadConnections,
  loadKeys,
  loadRefs,
} from "../config";
import { LCDClientExtra } from "./LCDClientExtra";
import * as R from "ramda";

export type Env = {
  config: (contract: string) => ContractConfig;
  refs: { [contractName: string]: ContractRef };
  wallets: { [key: string]: Wallet };
  client: LCDClientExtra;
};

export const getEnv = (
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
