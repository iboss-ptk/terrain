import { LCDClient, LocalTerra, Wallet } from "@terra-money/terra.js";
import { cli } from "cli-ux";
import * as path from "path";
import { loadKeys } from "../config";

export const getSigner = ({
  network,
  signerId,
  keysPath,
  lcd,
}: {
  network: string;
  signerId: string;
  keysPath: string;
  lcd: LCDClient;
}) => {
  const localterra = new LocalTerra();
  if (network === "localterra" && localterra.wallets.hasOwnProperty(signerId)) {
    cli.log(`using pre-baked '${signerId}' wallet on localterra as signer`);
    // @ts-ignore
    return localterra.wallets[signerId];
  } else {
    const keys = loadKeys(path.join(process.cwd(), keysPath));

    if (!keys[signerId]) {
      cli.error(`key for '${signerId}' does not exists.`);
    }

    return new Wallet(lcd, keys[signerId]);
  }
};
