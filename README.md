terrain
=======

Terra development environment

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/terrain.svg)](https://npmjs.org/package/terrain)
[![Downloads/week](https://img.shields.io/npm/dw/terrain.svg)](https://npmjs.org/package/terrain)
[![License](https://img.shields.io/npm/l/terrain.svg)](https://github.com/https://github.com/iboss-ptk/terrain/terrain/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g terrain
$ terrain COMMAND
running command...
$ terrain (-v|--version|version)
terrain/0.0.0 darwin-x64 node-v15.11.0
$ terrain --help [COMMAND]
USAGE
  $ terrain COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`terrain help [COMMAND]`](#terrain-help-command)
* [`terrain new NAME`](#terrain-new-name)

## `terrain help [COMMAND]`

display help for terrain

```
USAGE
  $ terrain help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_

## `terrain new NAME`

create new dapp from template

```
USAGE
  $ terrain new NAME

OPTIONS
  --path=path  path to keep the project

EXAMPLES
  $ terrain new awesome-dapp
  $ terrain new awesome-dapp --path path/to/dapp
```

_See code: [src/commands/new.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.0/src/commands/new.ts)_
<!-- commandsstop -->
