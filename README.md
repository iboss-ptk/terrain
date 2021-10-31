# terrain

Terra development environment

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/terrain.svg)](https://npmjs.org/package/terrain)
[![Downloads/week](https://img.shields.io/npm/dw/terrain.svg)](https://npmjs.org/package/terrain)
[![License](https://img.shields.io/npm/l/terrain.svg)](https://github.com/https://github.com/iboss-ptk/terrain/terrain/blob/master/package.json)

<!-- toc -->
* [terrain](#terrain)
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
* [`terrain deploy CONTRACT`](#terrain-deploy-contract)
* [`terrain gen [FILE]`](#terrain-gen-file)
* [`terrain help [COMMAND]`](#terrain-help-command)
* [`terrain instantiate CONTRACT`](#terrain-instantiate-contract)
* [`terrain new NAME`](#terrain-new-name)
* [`terrain store-code CONTRACT`](#terrain-store-code-contract)
* [`terrain sync-refs [FILE]`](#terrain-sync-refs-file)

## `terrain deploy CONTRACT`

store code on chain and instantiate

```
USAGE
  $ terrain deploy CONTRACT

OPTIONS
  --config-path=config-path  [default: ./config.terrain.json]
  --instance-id=instance-id  [default: default]
  --keys-path=keys-path      [default: ./keys.terrain.js]
  --network=network          [default: localterra]
  --no-rebuild
  --refs-path=refs-path      [default: ./refs.terrain.json]
  --set-signer-as-admin
  --signer=signer            (required)
```

_See code: [src/commands/deploy.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.0/src/commands/deploy.ts)_

## `terrain gen [FILE]`

describe the command here

```
USAGE
  $ terrain gen [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/gen.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.0/src/commands/gen.ts)_

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

## `terrain instantiate CONTRACT`

instantiate contract

```
USAGE
  $ terrain instantiate CONTRACT

OPTIONS
  --code-id=code-id
  --config-path=config-path  [default: ./config.terrain.json]
  --instance-id=instance-id  [default: default]
  --keys-path=keys-path      [default: ./keys.terrain.js]
  --network=network          [default: localterra]
  --refs-path=refs-path      [default: ./refs.terrain.json]
  --set-signer-as-admin
  --signer=signer            (required)
```

_See code: [src/commands/instantiate.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.0/src/commands/instantiate.ts)_

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

## `terrain store-code CONTRACT`

store code on chain

```
USAGE
  $ terrain store-code CONTRACT

OPTIONS
  --config-path=config-path  [default: ./config.terrain.json]
  --keys-path=keys-path      [default: ./keys.terrain.js]
  --network=network          [default: localterra]
  --no-rebuild
  --refs-path=refs-path      [default: ./refs.terrain.json]
  --signer=signer            (required)
```

_See code: [src/commands/store-code.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.0/src/commands/store-code.ts)_

## `terrain sync-refs [FILE]`

sync configuration with frontend app

```
USAGE
  $ terrain sync-refs [FILE]

OPTIONS
  --dest=dest            [default: ./frontend/src/refs.terrain.json]
  --refs-path=refs-path  [default: ./refs.terrain.json]
```

_See code: [src/commands/sync-refs.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.0/src/commands/sync-refs.ts)_
<!-- commandsstop -->
