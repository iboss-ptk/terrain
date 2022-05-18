import * as R from "ramda";
import * as fs from "fs-extra";
import { LCDClientConfig, MnemonicKey, RawKey } from "@terra-money/terra.js";
import { cli } from "cli-ux";
import { CLIKey } from "@terra-money/terra.js/dist/key/CLIKey";

type Fee = {
  gasLimit: number;
  amount: { [coin: string]: number };
};

export type ContractConfig = {
  store: { fee: Fee };
  instantiation: {
    fee: Fee;
    instantiateMsg: Record<string, any>;
  };
};

type Config = {
  [contract: string]: ContractConfig;
};

type GlobalConfig = {
  _base: ContractConfig;
  [contract: string]: ContractConfig;
};

export type ContractRef = {
  codeId: number;
  contractAddresses: {
    [key: string]: string;
  };
};

export type Refs = {
  [network: string]: {
    [contract: string]: ContractRef;
  };
};

export const connection =
  (networks: { [network: string]: { _connection: LCDClientConfig } }) =>
  (network: string) =>
    networks[network]._connection ||
    cli.error(`network '${network}' not found in config`);

export const loadConnections = (
  path = `${__dirname}/template/config.terrain.json`
) => connection(fs.readJSONSync(path));

export const config =
  (allConfig: { _global: GlobalConfig; [network: string]: Partial<Config> }) =>
  (network: string, contract: string): ContractConfig => {
    const globalBaseConfig =
      (allConfig._global && allConfig._global._base) || {};
    const globalContractConfig =
      (allConfig._global && allConfig._global[contract]) || {};

    const baseConfig = (allConfig[network] && allConfig[network]._base) || {};
    const contractConfig =
      (allConfig[network] && allConfig[network][contract]) || {};

    return [
      allConfig._global._base,
      globalBaseConfig,
      globalContractConfig,
      baseConfig,
      contractConfig,
    ].reduce(R.mergeDeepRight) as any;
  };

export const saveConfig = (
  valuePath: string[],
  value: string | Record<string, any>,
  path: string
) => {
  const conf = fs.readJSONSync(path);
  const updated = R.set(R.lensPath(valuePath), value, conf);
  fs.writeJSONSync(path, updated, { spaces: 2 });
};

export const loadConfig = (
  path = `${__dirname}/template/config.terrain.json`
) => config(fs.readJSONSync(path));

export const loadKeys = (
  path = `${__dirname}/template/keys.terrain.js`
): { [keyName: string]: RawKey } => {
  const keys = require(path);
  return R.map(
    R.cond([
      [
        R.has('privateKey'),
        ({privateKey}) => {
          return new RawKey(Buffer.from(privateKey, 'base64'))
        },
      ],
      [R.has('mnemonic'), w => new MnemonicKey(w)],
      [R.has('keyName'), w => new CLIKey(w)],
      [
        R.T,
        () =>
          cli.error(
            'Error: Key must be defined with either `privateKey`, `mnemonic` or `keyName`'
          ),
      ],
    ]),
    keys
  );
};

export const setCodeId = (network: string, contract: string, codeId: number) =>
  R.set(R.lensPath([network, contract, "codeId"]), codeId);

export const setContractAddress = (
  network: string,
  contract: string,
  instanceId: string,
  contractAddress: string
) =>
  R.set(
    R.lensPath([network, contract, "contractAddresses", instanceId]),
    contractAddress
  );

export const loadRefs = (
  path = `${__dirname}/template/refs.terrain.json`
): Refs => fs.readJSONSync(path);

export const saveRefs = (refs: Refs, path: string) => {
  fs.writeJSONSync(path, refs, { spaces: 2 });
};
