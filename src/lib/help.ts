import {Help} from '@oclif/core'

function bold(text: string) {
  return `\x1B[1m${text}\x1B[0m`
}

function indent(text: string) {
  return `  ${text}`
}

export default class CustomHelp extends Help {
  async showRootHelp() {
    await super.showRootHelp()
    console.log(bold('REPOSITORY'))
    console.log(indent('https://github.com/iboss-ptk/terrain'))
  }
}
