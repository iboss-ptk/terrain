import {MnemonicKey, RawKey} from '@terra-money/terra.js'
import * as R from 'ramda'
import {config, loadConfig, loadKeys} from './config'

const _global = {
  _base: {
    store: {
      fee: {
        gasLimit: 2000000,
        amount: {
          uluna: 1000000,
        },
      },
    },
    instantiation: {
      fee: {
        gasLimit: 2000000,
        amount: {
          uluna: 1000000,
        },
      },
      instantiateMsg: {},
    },
  },
}

const _globalWithOverrides = R.mergeDeepRight(_global, {
  _base: {
    instantiation: {
      instantiateMsg: {count: 0},
    },
  },
  contract_a: {
    store: {
      fee: {
        amount: {
          uusd: 99999999,
        },
      },
    },
  },
}) as any

const local = {
  _base: {
    instantiation: {
      instantiateMsg: {count: 99},
    },
  },
  contract_a: {
    store: {
      fee: {
        gasLimit: 6969,
      },
    },
  },
} as any

test('config without overrides should return global base for any contract in any network', () => {
  const conf = config({_global})

  expect(conf('local', 'contract_a')).toEqual(_global._base)
  expect(conf('mainnet', 'contract_b')).toEqual(_global._base)
})

test('config with overrides in global should return overriden value for all networks', () => {
  const conf = config({_global: _globalWithOverrides})

  const contractAUpdated = {
    store: {
      fee: {
        gasLimit: 2000000,
        amount: {
          uluna: 1000000,
          uusd: 99999999,
        },
      },
    },
    instantiation: {
      fee: {
        gasLimit: 2000000,
        amount: {
          uluna: 1000000,
        },
      },
      instantiateMsg: {count: 0},
    },
  }

  expect(conf('local', 'contract_a')).toEqual(contractAUpdated)
  expect(conf('testnet', 'contract_a')).toEqual(contractAUpdated)
  expect(conf('mainnet', 'contract_a')).toEqual(contractAUpdated)

  expect(conf('local', 'contract_random')).toEqual(_globalWithOverrides._base)
})

test('config with overrides in _base for the network should overrides for all the contract within the network', () => {
  const conf = config({_global, local})
  const localContractA = {
    store: {
      fee: {
        gasLimit: 6969,
        amount: {
          uluna: 1000000,
        },
      },
    },
    instantiation: {
      fee: {
        gasLimit: 2000000,
        amount: {
          uluna: 1000000,
        },
      },
      instantiateMsg: {count: 99},
    },
  }
  const localOtherContract = {
    store: {
      fee: {
        gasLimit: 2000000,
        amount: {
          uluna: 1000000,
        },
      },
    },
    instantiation: {
      fee: {
        gasLimit: 2000000,
        amount: {
          uluna: 1000000,
        },
      },
      instantiateMsg: {count: 99},
    },
  }

  expect(conf('local', 'contract_a')).toEqual(localContractA)
  expect(conf('local', 'contract_b')).toEqual(localOtherContract)
  expect(conf('local', 'contract_c')).toEqual(localOtherContract)
  expect(conf('mainnet', 'contract_a')).toEqual(_global._base)
})

test('load config', () => {
  const conf = loadConfig()
  expect(conf('localterra', 'contract_a')).toEqual({
    store: {
      fee: {
        gasLimit: 2000000,
        amount: {
          uluna: 1000000,
        },
      },
    },
    instantiation: {
      fee: {
        gasLimit: 2000000,
        amount: {
          uluna: 1000000,
        },
      },
      instantiateMsg: {count: 0},
    },
  })
})

test('load wallets', () => {
  const wallets = loadKeys()
  const ct1 = wallets.custom_tester_1 as MnemonicKey
  expect(ct1.mnemonic).toBe(
    'shiver position copy catalog upset verify cheap library enjoy extend second peasant basic kit polar business document shrug pass chuckle lottery blind ecology stand'
  )

  const ct2 = wallets.custom_tester_2 as RawKey
  expect(ct2.privateKey.toString('base64')).toBe(
    'fGl1yNoUnnNUqTUXXhxH9vJU0htlz9lWwBt3fQw+ixw='
  )
})
