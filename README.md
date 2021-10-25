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
* [`terrain hello [FILE]`](#terrain-hello-file)
* [`terrain help [COMMAND]`](#terrain-help-command)

## `terrain hello [FILE]`

describe the command here

```
USAGE
  $ terrain hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ terrain hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/iboss-ptk/terrain/terrain/blob/v0.0.0/src/commands/hello.ts)_

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
<!-- commandsstop -->
