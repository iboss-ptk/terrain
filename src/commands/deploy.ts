import { Command, flags } from '@oclif/command'
import { execSync } from 'child_process'
import { Fee, LocalTerra, MsgInstantiateContract, MsgStoreCode } from '@terra-money/terra.js'
import * as fs from 'fs-extra'
import { cli } from 'cli-ux'


// TODO: depends on configuration
const terra = new LocalTerra()

export default class Deploy extends Command {
  static description = 'describe the command here'

  static flags = {
    'no-rebuild': flags.boolean({ default: false })
  }

  static args = [{ name: 'contract', required: true }]

  async run() {
    const { args, flags } = this.parse(Deploy)
    process.chdir(`contracts/${args.contract}`)

    if (!flags['no-rebuild']) {
      execSync('cargo wasm && cargo run-script optimize', { stdio: 'inherit' })
    }

    // LCD TO DEPLOY, needs to prover wallet
    const signer = terra.wallets.validator
    const wasmByteCode = fs.readFileSync(`artifacts/${args.contract.replace(/\-/g, '_')}.wasm`).toString('base64')

    cli.action.start('Storing wasm bytecode on chain')

    const storeCodeTx = await signer.createAndSignTx({
      msgs: [
        new MsgStoreCode(
          signer.key.accAddress,
          wasmByteCode
        ),

      ],
      // TODO configurable
      fee: new Fee(2000000, { uluna: 100000 }),
    });

    const res = await terra.tx.broadcast(storeCodeTx);
    cli.action.stop()
    const codeId = JSON.parse(res.raw_log)[0]
      .events.find((msg: { type: String }) => msg.type === 'store_code')
      .attributes.find((attr: { key: String }) => attr.key === 'code_id')
      .value


    cli.action.start(`instantiating contract with code id: ${codeId}`)


    // config file: fee, admin, signer, initmsg

    const instantiateTx = await signer.createAndSignTx({
      msgs: [
        new MsgInstantiateContract(
          signer.key.accAddress,
          undefined, // can migrate
          codeId,
          { count: 0 }
        ),
      ],
      // TODO configurable
      fee: new Fee(2000000, { uluna: 100000 }),
    });

    const resInstant = await terra.tx.broadcast(instantiateTx);

    cli.action.stop()

    cli.log(JSON.stringify(JSON.parse(resInstant.raw_log), null, 2))
  }
}
