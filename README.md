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
$ npm install -g @iboss/terrain
$ terrain COMMAND
running command...
$ terrain (-v|--version|version)
@iboss/terrain/0.0.3 darwin-x64 node-v15.11.0
$ terrain --help [COMMAND]
USAGE
  $ terrain COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`terrain code:migrate [FILE]`](#terrain-codemigrate-file)
* [`terrain code:new [NAME]`](#terrain-codenew-name)
* [`terrain code:store CONTRACT`](#terrain-codestore-contract)
* [`terrain contract:instantiate CONTRACT`](#terrain-contractinstantiate-contract)
* [`terrain deploy CONTRACT`](#terrain-deploy-contract)
* [`terrain help [COMMAND]`](#terrain-help-command)
* [`terrain new NAME`](#terrain-new-name)
* [`terrain sync-refs [FILE]`](#terrain-sync-refs-file)

## `terrain code:migrate [FILE]`

describe the command here

```
USAGE
  $ terrain code:migrate [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/code/migrate.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.3/src/commands/code/migrate.ts)_

## `terrain code:new [NAME]`

generate new contract

```
USAGE
  $ terrain code:new [NAME]

OPTIONS
  --path=path        [default: ./contracts] path to keep the contracts
  --version=version  [default: 0.16]
```

_See code: [src/commands/code/new.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.3/src/commands/code/new.ts)_

## `terrain code:store CONTRACT`

store code on chain

```
USAGE
  $ terrain code:store CONTRACT

OPTIONS
  --config-path=config-path  [default: ./config.terrain.json]
  --keys-path=keys-path      [default: ./keys.terrain.js]
  --network=network          [default: localterra]
  --no-rebuild
  --refs-path=refs-path      [default: ./refs.terrain.json]
  --signer=signer            (required)
```

_See code: [src/commands/code/store.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.3/src/commands/code/store.ts)_

## `terrain contract:instantiate CONTRACT`

instantiate contract

```
USAGE
  $ terrain contract:instantiate CONTRACT

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

_See code: [src/commands/contract/instantiate.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.3/src/commands/contract/instantiate.ts)_

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

_See code: [src/commands/deploy.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.3/src/commands/deploy.ts)_

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
  --path=path        path to keep the project
  --version=version  [default: 0.16]

EXAMPLES
  $ terrain new awesome-dapp
  $ terrain new awesome-dapp --path path/to/dapp
```

_See code: [src/commands/new.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.3/src/commands/new.ts)_

## `terrain sync-refs [FILE]`

sync configuration with frontend app

```
USAGE
  $ terrain sync-refs [FILE]

OPTIONS
  --dest=dest            [default: ./frontend/src/refs.terrain.json]
  --refs-path=refs-path  [default: ./refs.terrain.json]
```

_See code: [src/commands/sync-refs.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.3/src/commands/sync-refs.ts)_
<!-- commandsstop -->
