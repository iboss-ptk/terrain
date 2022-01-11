import {
  AccAddress,
  Fee,
  LCDClient,
  MsgInstantiateContract,
  MsgMigrateCode,
  MsgMigrateContract,
  MsgStoreCode,
  Wallet,
} from "@terra-money/terra.js";
import { execSync } from "child_process";
import {
  ContractConfig,
  loadRefs,
  saveRefs,
  setCodeId,
  setContractAddress,
} from "../config";
import * as fs from "fs-extra";
import { cli } from "cli-ux";
import * as YAML from "yaml";

type StoreCodeParams = {
  conf: ContractConfig;
  network: string;
  refsPath: string;
  lcd: LCDClient;

  noRebuild: boolean;
  contract: string;
  signer: Wallet;
  codeId?: number;
};
export const storeCode = async ({
  conf,
  noRebuild,
  contract,
  signer,
  network,
  refsPath,
  lcd,
  codeId,
}: StoreCodeParams) => {
  process.chdir(`contracts/${contract}`);

  if (!noRebuild) {
    execSync("cargo wasm", { stdio: "inherit" });

    // Need to use the rust-optimizer-arm64 image on arm64 architecture.
    if (process.arch === 'arm64') {
      execSync(`docker run --rm -v "$(pwd)":/code \
      --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
      --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
      cosmwasm/rust-optimizer-arm64:0.12.4`);
    } else {
      execSync("cargo run-script optimize", { stdio: "inherit" });
    }
  }

  // Replace dashses with underscores, and append `-aarch64` if the user is using an arm64 processor.
  const wasmFileName = `artifacts/${contract.replace(/-/g, "_")}${process.arch === "arm64" ? "-aarch64" : null}.wasm`;
  const wasmByteCode = fs
    .readFileSync(wasmFileName)
    .toString("base64");

  cli.action.start("storing wasm bytecode on chain");

  const store = conf.store;
  const storeCodeTx = await signer.createAndSignTx({
    msgs: [
      typeof codeId !== "undefined"
        ? new MsgMigrateCode(signer.key.accAddress, codeId, wasmByteCode)
        : new MsgStoreCode(signer.key.accAddress, wasmByteCode),
    ],
    fee: new Fee(store.fee.gasLimit, store.fee.amount),
  });

  const res = await lcd.tx.broadcast(storeCodeTx);
  cli.action.stop();

  try {
    const savedCodeId = JSON.parse(res.raw_log)[0]
      .events.find((msg: { type: string }) => msg.type === "store_code")
      .attributes.find((attr: { key: string }) => attr.key === "code_id").value;

    process.chdir("../..");
    const updatedRefs = setCodeId(
      network,
      contract,
      savedCodeId
    )(loadRefs(refsPath));
    saveRefs(updatedRefs, refsPath);
    cli.log(`code is stored at code id: ${savedCodeId}`);

    return savedCodeId;
  } catch (error) {
    if (error instanceof SyntaxError) {
      cli.error(res.raw_log);
    } else {
      cli.error(`Unexpcted Error: ${error}`);
    }
  }
};

type InstantiateParams = {
  conf: ContractConfig;
  signer: Wallet;
  network: string;
  refsPath: string;
  lcd: LCDClient;
  admin?: AccAddress;
  contract: string;
  codeId: number;
  instanceId: string;
};

export const instantiate = async ({
  conf,
  refsPath,
  network,
  lcd,
  signer,
  admin,
  contract,
  codeId,
  instanceId,
}: InstantiateParams) => {
  const instantiation = conf.instantiation;

  cli.action.start(`instantiating contract with code id: ${codeId}`);

  const instantiateTx = await signer.createAndSignTx({
    msgs: [
      new MsgInstantiateContract(
        signer.key.accAddress,
        admin, // can migrate
        codeId,
        instantiation.instantiateMsg
      ),
    ],
    fee: new Fee(instantiation.fee.gasLimit, instantiation.fee.amount),
  });

  const resInstant = await lcd.tx.broadcast(instantiateTx);

  let log = [];
  try {
    log = JSON.parse(resInstant.raw_log);
  } catch (error) {
    cli.action.stop();
    if (error instanceof SyntaxError) {
      cli.error(resInstant.raw_log);
    } else {
      cli.error(`Unexpcted Error: ${error}`);
    }
  }

  cli.action.stop();

  const contractAddress = log[0].events
    .find((event: { type: string }) => event.type === "instantiate_contract")
    .attributes.find(
      (attr: { key: string }) => attr.key === "contract_address"
    ).value;

  const updatedRefs = setContractAddress(
    network,
    contract,
    instanceId,
    contractAddress
  )(loadRefs(refsPath));
  saveRefs(updatedRefs, refsPath);

  cli.log(YAML.stringify(log));
};

type MigrateParams = {
  conf: ContractConfig;
  signer: Wallet;
  contract: string;
  codeId: number;
  network: string;
  instanceId: string;
  refsPath: string;
  lcd: LCDClient;
};

export const migrate = async ({
  conf,
  refsPath,
  lcd,
  signer,
  contract,
  codeId,
  network,
  instanceId,
}: MigrateParams) => {
  const instantiation = conf.instantiation;

  cli.action.start(`instantiating contract with code id: ${codeId}`);
  const refs = loadRefs(refsPath);

  const contractAddress = refs[network][contract].contractAddresses[instanceId];

  const instantiateTx = await signer.createAndSignTx({
    msgs: [
      new MsgMigrateContract(
        signer.key.accAddress,
        contractAddress,
        codeId,
        instantiation.instantiateMsg
      ),
    ],
    fee: new Fee(instantiation.fee.gasLimit, instantiation.fee.amount),
  });

  const resInstant = await lcd.tx.broadcast(instantiateTx);

  let log = [];
  try {
    log = JSON.parse(resInstant.raw_log);
  } catch (error) {
    cli.action.stop();
    if (error instanceof SyntaxError) {
      cli.error(resInstant.raw_log);
    } else {
      cli.error(`Unexpcted Error: ${error}`);
    }
  }

  cli.action.stop();

  // const contractAddress = log[0].events
  //   .find((event: { type: string }) => event.type === "instantiate_contract")
  //   .attributes.find(
  //     (attr: { key: string }) => attr.key === "contract_address"
  //   ).value;

  const updatedRefs = setContractAddress(
    network,
    contract,
    instanceId,
    contractAddress
  )(loadRefs(refsPath));
  saveRefs(updatedRefs, refsPath);

  cli.log(YAML.stringify(log));
};
