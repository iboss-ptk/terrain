import {
  AccAddress,
  Fee,
  LCDClient,
  MsgInstantiateContract,
  MsgMigrateCode,
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
  noRebuild: boolean;
  contract: string;
  signer: Wallet;
  network: string;
  refsPath: string;
  lcd: LCDClient;
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
    execSync("cargo run-script optimize", { stdio: "inherit" });
  }

  const wasmByteCode = fs
    .readFileSync(`artifacts/${contract.replace(/-/g, "_")}.wasm`)
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
    console.log("SET DONE++++++++++++++");
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
  admin?: AccAddress;
  contract: string;
  codeId: number;
  network: string;
  instanceId: string;
  refsPath: string;
  lcd: LCDClient;
};

export const instantiate = async ({
  conf,
  signer,
  admin,
  contract,
  codeId,
  network,
  instanceId,
  refsPath,
  lcd,
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
