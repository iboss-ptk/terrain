import { Command, flags } from '@oclif/command'
import { execSync } from 'child_process'
import { Fee, LocalTerra, MsgInstantiateContract, MsgStoreCode } from '@terra-money/terra.js'
import * as fs from 'fs-extra'
import { cli } from 'cli-ux'
import * as YAML from 'yaml'
import { loadConfig, saveConfig } from '../config'


// TODO: depends on configuration
const terra = new LocalTerra()

export default class Deploy extends Command {
  static description = 'store code on chain and instantiate'

  static flags = {
    'no-rebuild': flags.boolean({ default: false }),
    'network': flags.string({ default: 'localterra' }),
    'config': flags.string({ default: './config.terrain.json' }),
    'instance': flags.string({ default: 'default' }),
  }

  static args = [{ name: 'contract', required: true }]

  async run() {
    const { args, flags } = this.parse(Deploy)

    const config = loadConfig(flags.config)

    const conf = config(flags.network, args.contract)

    // TODO: only allow snake case validation (also in new)

    process.chdir(`contracts/${args.contract}`)

    if (!flags['no-rebuild']) {
      execSync('cargo wasm', { stdio: 'inherit' })
      execSync('cargo run-script optimize', { stdio: 'inherit' })
    }

    // LCD TO DEPLOY, needs to prover wallet
    const signer = terra.wallets.validator
    const wasmByteCode = fs.readFileSync(`artifacts/${args.contract.replace(/-/g, '_')}.wasm`).toString('base64')

    cli.action.start('Storing wasm bytecode on chain')

    const store = conf.store
    const storeCodeTx = await signer.createAndSignTx({
      msgs: [
        new MsgStoreCode(
          signer.key.accAddress,
          wasmByteCode
        ),

      ],
      fee: new Fee(store.fee.gasLimit, store.fee.amount),
    })

    const res = await terra.tx.broadcast(storeCodeTx)
    cli.action.stop()
    const codeId = JSON.parse(res.raw_log)[0]
      .events.find((msg: { type: string }) => msg.type === 'store_code')
      .attributes.find((attr: { key: string }) => attr.key === 'code_id')
      .value

    cli.action.start(`instantiating contract with code id: ${codeId}`)

    process.chdir('../..')
    saveConfig([flags.network, args.contract, 'codeId'], codeId, flags.config)
    // config file: admin, signer, 

    const instantiation = conf.instantiation

    console.log(instantiation)

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
    })

    const resInstant = await terra.tx.broadcast(instantiateTx)

    cli.action.stop()

    const log = JSON.parse(resInstant.raw_log)

    const contractAddress = log[0]
      .events.find((event: { type: string }) => event.type === 'instantiate_contract')
      .attributes.find((attr: { key: string }) => attr.key === 'contract_address')
      .value


    saveConfig([flags.network, args.contract, 'contractAddresses', flags.instance], contractAddress, flags.config)

    cli.log(YAML.stringify(log))
  }
}
