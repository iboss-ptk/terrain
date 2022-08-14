__THIS REPO IS ARCHIVED IN FAVOR OF [terra-money/terrain](https://github.com/terra-money/terrain).__

@iboss-ptk, original author, is actively working on similar tool called [Beaker](https://github.com/osmosis-labs/beaker). That is started on Osmosis, but designed be adaptable on every cosmwasm enabled chain.

---

# Terrain

<p align="center" >
<a alt="terrain logo is generative, click to see the code!" href="https://editor.p5js.org/iboss-ptk/sketches/-mAM5HzH_">
<img src="./logo.png" alt="terrain logo" width="200"/>
</a>
</p>

<p align="center" >
<b>Terrain</b> – Terra development environment for better smart contract development experience
</p>

---

Terrain will help you:

- scaffold your dapp project
- ease the development and deployment process
- create custom task for blockchain and contract interaction with less boilerplate code
  - using terra.js directly could be cumbersome, Terrain gives you extensions and utilities to help you
- console to terra blockchain, an interactive repl which have the same extensions and utilities as custom task
- ability to predefine functions to be used in task and console

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/terrain.svg)](https://npmjs.org/package/terrain)
[![Downloads/week](https://img.shields.io/npm/dw/terrain.svg)](https://npmjs.org/package/terrain)
[![License](https://img.shields.io/npm/l/terrain.svg)](https://github.com/https://github.com/iboss-ptk/terrain/terrain/blob/master/package.json)

<!-- toc -->
* [Terrain](#terrain)
* [Setup](#setup)
* [set 'stable' as default release channel (used when updating rust)](#set-stable-as-default-release-channel-used-when-updating-rust)
* [add wasm as compilation target](#add-wasm-as-compilation-target)
* [for generating contract](#for-generating-contract)
* [Getting Started](#getting-started)
* [for first time, you might want to `npm install -g @iboss/terrain`](#for-first-time-you-might-want-to-npm-install--g-ibossterrain)
* [or run `npx @iboss/terrain new my-terra-dapp`](#or-run-npx-ibossterrain-new-my-terra-dapp)
* [since `terrain` npm module name is occupied by another module](#since-terrain-npm-module-name-is-occupied-by-another-module)
* [Migrating CosmWasm contracts on Terra](#migrating-cosmwasm-contracts-on-terra)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Setup

## Download LocalTerra

For local developement environment, you need [LocalTerra](https://github.com/terra-money/localterra).

_**note:** if you are using m1 chip, you might need to update your Docker Desktop due to [qemu bug](https://github.com/docker/for-mac/issues/5561)_

```sh
git clone --branch v0.5.2 --depth 1 https://github.com/terra-money/localterra
cd localterra
docker-compose up
```

## Setup Rust

While WASM smart contracts can theoretically be written in any programming language, we currently only recommend using Rust as it is the only language for which mature libraries and tooling exist for CosmWasm. For this tutorial, you'll need to also install the latest version of Rust by following the instructions [here](https://www.rust-lang.org/tools/install).

Then run the following commands

```sh
# set 'stable' as default release channel (used when updating rust)
rustup default stable

# add wasm as compilation target
rustup target add wasm32-unknown-unknown

# for generating contract
cargo install cargo-generate --features vendored-openssl
cargo install cargo-run-script
```

# Getting Started

Assumed that you have [npm](https://www.npmjs.com/) installed, let's generate our first app

```sh
# for first time, you might want to `npm install -g @iboss/terrain` 
# or run `npx @iboss/terrain new my-terra-dapp`
# since `terrain` npm module name is occupied by another module
npx terrain new my-terra-dapp
cd my-terra-dapp
npm install
```

## Project Structure

The project structure will look like this:

```
.
├── contracts              # contracts' source code
│   ├── counter
│   └── ...                # more contract can be added here
├── frontend               # frontend application
├── lib                    # predefined functions for task and console
├── tasks                  # predefined tasks
├── keys.terrain.js        # keys for signing transacitons
├── config.terrain.json    # config for connections and contract deployments
└── refs.terrain.json      # deployed code and contract referecnes
```

You will now have counter example contract (no pun intended).

## Deployment

We can right away deploy the contract on LocalTerra. Not specifying network will be defaulted to `localterra`.

```sh
npx terrain deploy counter --signer validator
```

> `npx` will use project's `terrain` binary instead of the global one.

note that signer `validator` is one of a [pre-configured accounts with balances on LocalTerra](https://github.com/terra-money/LocalTerra#accounts).

Deploy command will build and optimize wasm code, store it on the blockchain and instantiate the contract.

You can deploy to different network defined in the `config.terrain.json` (`mainnet` and `testnet`). But you can not use the pre-configured accounts anymore. So you need to first update your `keys.terrain.js`

```js
// can use `process.env.SECRET_MNEMONIC` or `process.env.SECRET_PRIV_KEY`
// to populate secret in CI environment instead of hardcoding

module.exports = {
  custom_tester_1: {
    mnemonic:
      "shiver position copy catalog upset verify cheap library enjoy extend second peasant basic kit polar business document shrug pass chuckle lottery blind ecology stand",
  },
  custom_tester_2: {
    privateKey: "fGl1yNoUnnNUqTUXXhxH9vJU0htlz9lWwBt3fQw+ixw=",
  },
};
```

Apparently, there are some example accounts pre-defined in there. But **DON'T USE THEM ON MAINNET** since it is not a secret anymore.

For demonstration purpose, we are going to use `custom_tester_1`.

First, get some Luna from [the faucet](https://faucet.terra.money/) to pay for gas. Notice that it requires address but you only have `mnenomic` or `private_key` in `keys.terrain.js`.

The easiest way to retrive the address is to use console:

```sh
npx terrain console

terrain > wallets.custom_tester_1.key.accAddress
'terra1qd9fwwgnwmwlu2csv49fgtum3rgms64s8tcavp'
```

Now you can request for Luna on the faucet then check your balance in console.

```sh
terrain > (await client.bank.balance(wallets.custom_tester_1.key.accAddress))[0]
```

`client` is an [LCDClient](https://terra-money.github.io/terra.js/classes/client_lcd_LCDClient.LCDClient.html) (LCD stands for "Light Client Daemon" as opposed to FCD a "Fulll Client Daemon", if you are curious) with some extra utility function. And `wallets` contains list of [Wallet](https://terra-money.github.io/terra.js/classes/client_lcd_Wallet.Wallet.html).

```sh
npx terrain deploy counter --signer custom_tester_1 --network testnet
```

Same goes for mainnet deployment, you might want to store your secrets in enviroment variable instead, which you can populate them through `process.env.SOME_SECRET` in `keys.terrain.json`.

You can also separate storing code
from contract instantiation
as using:

- [`terrain code:store CONTRACT`](#terrain-codestore-contract)
- [`terrain contract:instantiate CONTRACT`](#terrain-contractmigrate-contract)

After deployment, `refs.terrain.json` will get updated. Refs file contains contract references on all network.

```json
{
  "localterra": {
    "counter": {
      "codeId": "1",
      "contractAddresses": {
        "default": "terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5"
      }
    }
  },
  "testnet": {
    "counter": {
      "codeId": "18160",
      "contractAddresses": {
        "default": "terra15faphq99pap3fr0dwk46826uqr2usve739l7ms"
      }
    }
  }
}

```

This information is used by terrain's utility functions and also the frontend template.

But in order to use it with frontend, You sync this in to `frontend/src` since it can not import file outside its rootDir (`src`). Todo so, run:

```sh
npx terrain sync-refs
```

> This is not ideal, ideas and contribution are more than welcome

With this, we can now start frontend:

```sh
cd frontend
npm run start
```

Switching network in your terra wallet extension will result in referencing to different contract address in the respective network.

## Lib, Console and Task

With the template setup, you can do this

```sh
npx terrain console
terrain > await lib.increment()
...
terrain > await lib.getCount()
{ count: 0 }
```

> `npx terrain console --network <NETWORK>` is also possible

Where does this lib functions comes from?

The answer is here:

```js
// lib/index.js

module.exports = ({ wallets, refs, config, client }) => ({
  getCount: () => client.query("counter", { get_count: {} }),
  increment: (signer = wallets.validator) =>
    client.execute(signer, "counter", { increment: {} }),
});
```

With this, you can interact with your contract or the blockchain interactively with your own abstractions.

You can use the lib to create task as well:

```js
// tasks/example-with-lib.js

const { task } = require("@iboss/terrain");
const lib = require("../lib");

task(async (env) => {
  const { getCount, increment } = lib(env);
  console.log("count 1 = ", await getCount());
  await increment();
  console.log("count 2 = ", await getCount());
});
```

To run this task:

```sh
npx terrain task:run example-with-lib
```

To create new task, run:

```sh
npx terrain task:new task-name
```

You might noticed by now that the `env` (`wallets`, `refs`, `config`, `client`) in task and lib are the ones that available in the console context.

Also, you can access `terrajs` in the console or import it in the lib or task to create custom interaction like in `tasks/example-custom-logic.js` or more complex one, if you are willing to do so, please consult [terra.js doc](https://terra-money.github.io/terra.js/).

```js
// tasks/example-custom-logic.js

const { task, terrajs } = require("@iboss/terrain");

// terrajs is basically re-exported terra.js (https://terra-money.github.io/terra.js/)

task(async ({ wallets, refs, config, client }) => {
  console.log("creating new key");
  const key = terrajs.MnemonicKey();
  console.log("private key", key.privateKey.toString("base64"));
  console.log("mnemonic", key.mnemonic);
});

```
---

# Migrating CosmWasm contracts on Terra

(Thanks to @octalmage)

On Terra it is possible to initilize contracts as migratable. This functionallity allows the adminstrator to upload a new version of the contract, then send a migrate message to move to the new code.

We'll be using Terrain, a Terra development suite to ease the scaffolding, deployment, and migration of our contracts. 

This tutorial builds on top of the Terrain quick start guide: https://docs.terra.money/Tutorials/Quick-start/Initial-setup.html

## Adding MigrateMsg to contract

There's two steps required to make a contract migratable: 

1. Smart contract handles the MigrateMsg transaction. 
2. Smart contract has an admin set, which is the address that's allowed to perform migrations. 

To implement support for MigrateMsg you will need to add the message to `msg.rs`: 

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct MigrateMsg {}
```

You can place this anywhere, I usually stick it above the InstantiateMsg struct.

With MigrateMsg defined we need to update `contract.rs`. First update the import from `crate::msg` to include `MigrateMsg`:

```rust
use crate::msg::{CountResponse, ExecuteMsg, InstantiateMsg, QueryMsg, MigrateMsg};
```

Then add the following method above `instantiate`: 

```rust
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn migrate(_deps: DepsMut, _env: Env, _msg: MigrateMsg) -> StdResult<Response> {
    Ok(Response::default())
}
```

## Calling migrate

In the previous Terrain tutorial we showed you how to deploy the contract, but we did not initilize it as migratable. 

After adding MigrateMsg to the smart contract we can redeploy and add the `--set-signer-as-admin` flag. This tells Terra that the transaction signer is allowed to migrate the contract in the future. 


```sh
npx terrain deploy counter --signer validator --set-signer-as-admin
```

With the new contract deployed you can make some changes, then migrate to the new code with the following command: 

```sh
npx terrain contract:migrate counter --signer validator
```

---

# Usage

<!-- usage -->
```sh-session
$ npm install -g @iboss/terrain
$ terrain COMMAND
running command...
$ terrain (-v|--version|version)
@iboss/terrain/0.0.9 darwin-x64 node-v17.0.1
$ terrain --help [COMMAND]
USAGE
  $ terrain COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`terrain code:new [NAME]`](#terrain-codenew-name)
* [`terrain code:store CONTRACT`](#terrain-codestore-contract)
* [`terrain console`](#terrain-console)
* [`terrain contract:instantiate CONTRACT`](#terrain-contractinstantiate-contract)
* [`terrain contract:migrate [CONTRACT]`](#terrain-contractmigrate-contract)
* [`terrain deploy CONTRACT`](#terrain-deploy-contract)
* [`terrain help [COMMAND]`](#terrain-help-command)
* [`terrain new NAME`](#terrain-new-name)
* [`terrain sync-refs [FILE]`](#terrain-sync-refs-file)
* [`terrain task:new [TASK]`](#terrain-tasknew-task)
* [`terrain task:run [TASK]`](#terrain-taskrun-task)

## `terrain code:new [NAME]`

Generate new contract.

```
USAGE
  $ terrain code:new [NAME] [--path <value>] [--version <value>]

FLAGS
  --path=<value>     [default: ./contracts] path to keep the contracts
  --version=<value>  [default: 0.16]

DESCRIPTION
  Generate new contract.
```

_See code: [src/commands/code/new.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.9/src/commands/code/new.ts)_

## `terrain code:store CONTRACT`

Store code on chain.

```
USAGE
  $ terrain code:store [CONTRACT] --signer <value> [--no-rebuild] [--network <value>] [--config-path <value>]
    [--refs-path <value>] [--keys-path <value>] [--code-id <value>]

FLAGS
  --code-id=<value>
  --config-path=<value>  [default: ./config.terrain.json]
  --keys-path=<value>    [default: ./keys.terrain.js]
  --network=<value>      [default: localterra]
  --no-rebuild
  --refs-path=<value>    [default: ./refs.terrain.json]
  --signer=<value>       (required)

DESCRIPTION
  Store code on chain.
```

_See code: [src/commands/code/store.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.9/src/commands/code/store.ts)_

## `terrain console`

Start a repl console that provides context and convinient utilities to interact with the blockchain and your contracts.

```
USAGE
  $ terrain console [--network <value>] [--config-path <value>] [--refs-path <value>] [--keys-path <value>]

FLAGS
  --config-path=<value>  [default: config.terrain.json]
  --keys-path=<value>    [default: keys.terrain.js]
  --network=<value>      [default: localterra]
  --refs-path=<value>    [default: refs.terrain.json]

DESCRIPTION
  Start a repl console that provides context and convinient utilities to interact with the blockchain and your
  contracts.
```

_See code: [src/commands/console.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.9/src/commands/console.ts)_

## `terrain contract:instantiate CONTRACT`

Instantiate the contract.

```
USAGE
  $ terrain contract:instantiate [CONTRACT] --signer <value> [--network <value>] [--config-path <value>] [--refs-path
    <value>] [--keys-path <value>] [--instance-id <value>] [--code-id <value>] [--set-signer-as-admin]

FLAGS
  --code-id=<value>      target code id for migration, can do only once after columbus-5 upgrade
  --config-path=<value>  [default: ./config.terrain.json]
  --instance-id=<value>  [default: default]
  --keys-path=<value>    [default: ./keys.terrain.js]
  --network=<value>      [default: localterra]
  --refs-path=<value>    [default: ./refs.terrain.json]
  --set-signer-as-admin
  --signer=<value>       (required)

DESCRIPTION
  Instantiate the contract.
```

_See code: [src/commands/contract/instantiate.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.9/src/commands/contract/instantiate.ts)_

## `terrain contract:migrate [CONTRACT]`

Migrate the contract.

```
USAGE
  $ terrain contract:migrate [CONTRACT] --signer <value> [--network <value>] [--config-path <value>] [--refs-path
    <value>] [--keys-path <value>] [--instance-id <value>] [--code-id <value>]

FLAGS
  --code-id=<value>      target code id for migration
  --config-path=<value>  [default: ./config.terrain.json]
  --instance-id=<value>  [default: default]
  --keys-path=<value>    [default: ./keys.terrain.js]
  --network=<value>      [default: localterra]
  --refs-path=<value>    [default: ./refs.terrain.json]
  --signer=<value>       (required)

DESCRIPTION
  Migrate the contract.
```

_See code: [src/commands/contract/migrate.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.9/src/commands/contract/migrate.ts)_

## `terrain deploy CONTRACT`

Build wasm bytecode, store code on chain and instantiate.

```
USAGE
  $ terrain deploy [CONTRACT] --signer <value> [--no-rebuild] [--network <value>] [--config-path <value>]
    [--refs-path <value>] [--keys-path <value>] [--instance-id <value>] [--set-signer-as-admin] [--admin-address
    <value>] [--frontend-refs-path <value>]

FLAGS
  --admin-address=<value>       set custom address as contract admin to allow migration.
  --config-path=<value>         [default: ./config.terrain.json]
  --frontend-refs-path=<value>  [default: ./frontend/src/refs.terrain.json]
  --instance-id=<value>         [default: default]
  --keys-path=<value>           [default: ./keys.terrain.js]
  --network=<value>             [default: localterra]
  --no-rebuild                  deploy the wasm bytecode as is.
  --refs-path=<value>           [default: ./refs.terrain.json]
  --set-signer-as-admin         set signer (deployer) as admin to allow migration.
  --signer=<value>              (required)

DESCRIPTION
  Build wasm bytecode, store code on chain and instantiate.
```

_See code: [src/commands/deploy.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.9/src/commands/deploy.ts)_

## `terrain help [COMMAND]`

display help for terrain

```
USAGE
  $ terrain help [COMMAND] [--all]

ARGUMENTS
  COMMAND  command to show help for

FLAGS
  --all  see all commands in CLI

DESCRIPTION
  display help for terrain
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_

## `terrain new NAME`

Create new dapp from template.

```
USAGE
  $ terrain new [NAME] [--path <value>] [--version <value>]

FLAGS
  --path=<value>     path to keep the project
  --version=<value>  [default: 0.16]

DESCRIPTION
  Create new dapp from template.

EXAMPLES
  $ terrain new awesome-dapp

  $ terrain new awesome-dapp --path path/to/dapp
```

_See code: [src/commands/new.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.9/src/commands/new.ts)_

## `terrain sync-refs [FILE]`

Sync configuration with frontend app.

```
USAGE
  $ terrain sync-refs [FILE] [--refs-path <value>] [--dest <value>]

FLAGS
  --dest=<value>       [default: ./frontend/src/refs.terrain.json]
  --refs-path=<value>  [default: ./refs.terrain.json]

DESCRIPTION
  Sync configuration with frontend app.
```

_See code: [src/commands/sync-refs.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.9/src/commands/sync-refs.ts)_

## `terrain task:new [TASK]`

create new task

```
USAGE
  $ terrain task:new [TASK]

DESCRIPTION
  create new task
```

_See code: [src/commands/task/new.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.9/src/commands/task/new.ts)_

## `terrain task:run [TASK]`

run predefined task

```
USAGE
  $ terrain task:run [TASK] [--network <value>] [--config-path <value>] [--refs-path <value>] [--keys-path
    <value>]

FLAGS
  --config-path=<value>  [default: config.terrain.json]
  --keys-path=<value>    [default: keys.terrain.js]
  --network=<value>      [default: localterra]
  --refs-path=<value>    [default: refs.terrain.json]

DESCRIPTION
  run predefined task
```

_See code: [src/commands/task/run.ts](https://github.com/iboss-ptk/terrain/blob/v0.0.9/src/commands/task/run.ts)_
<!-- commandsstop -->
