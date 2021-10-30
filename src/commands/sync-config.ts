import { Command, flags } from '@oclif/command'
import { cli } from 'cli-ux'
import * as fs from 'fs-extra'

export default class SyncConfig extends Command {
  static description = 'sync configuration with frontend app'

  static flags = {
    config: flags.string({ default: './config.terrain.json' }),
    dest: flags.string({ default: './frontend/src/config.terrain.json' }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const { args, flags } = this.parse(SyncConfig)

    cli.action.start(`syncing config from '${flags.config}' to '${flags.dest}`)
    fs.copyFileSync(flags.config, flags.dest)
    cli.action.stop()
  }
}
