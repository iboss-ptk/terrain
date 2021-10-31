import {
  Fee,
  LCDClient,
  MsgInstantiateContract,
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
};
export const storeCode = async ({
  conf,
  noRebuild,
  contract,
  signer,
  network,
  refsPath,
  lcd,
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
    msgs: [new MsgStoreCode(signer.key.accAddress, wasmByteCode)],
    fee: new Fee(store.fee.gasLimit, store.fee.amount),
  });

  const res = await lcd.tx.broadcast(storeCodeTx);
  cli.action.stop();
  const codeId = JSON.parse(res.raw_log)[0]
    .events.find((msg: { type: string }) => msg.type === "store_code")
    .attributes.find((attr: { key: string }) => attr.key === "code_id").value;

  process.chdir("../..");

  const updatedRefs = setCodeId(network, contract, codeId)(loadRefs(refsPath));
  saveRefs(updatedRefs, refsPath);

  cli.log(`code is stored at code id: ${codeId}`);

  return codeId;
};

type InstantiateParams = {
  conf: ContractConfig;
  signer: Wallet;
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
        undefined, // can migrate
        codeId,
        instantiation.instantiateMsg
      ),
    ],
    fee: new Fee(instantiation.fee.gasLimit, instantiation.fee.amount),
  });

  const resInstant = await lcd.tx.broadcast(instantiateTx);
  console.log(resInstant);

  let log = [];
  try {
    log = JSON.parse(resInstant.raw_log);
  } catch (e) {
    cli.action.stop();
    cli.error(resInstant.raw_log);
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
