import * as R from 'ramda'
import * as fs from 'fs-extra'


type Fee = {
    gasLimit: number;
    amount: { [coin: string]: number };
}

export type ContractConfig = {
    store: { fee: Fee };
    instantiation: { fee: Fee; instantiateMsg: Record<string, any> };
    codeId?: number,
    contractAddresses?: {
        [key: string]: string
    }
}

type Config = {
    [contract: string]: ContractConfig;
}

type GlobalConfig = {
    _base: ContractConfig;
} & Config

export const config = (allConfig: { _global: GlobalConfig, [network: string]: Partial<Config> }) =>
    (network: string, contract: string): ContractConfig => {
        const globalBaseConfig = (allConfig['_global'] && allConfig['_global']['_base']) || {}
        const globalContractConfig = (allConfig['_global'] && allConfig['_global'][contract]) || {}

        const baseConfig = (allConfig[network] && allConfig[network]['_base']) || {}
        const contractConfig = (allConfig[network] && allConfig[network][contract]) || {}


        return [
            allConfig['_global']['_base'],
            globalBaseConfig,
            globalContractConfig,
            baseConfig,
            contractConfig
        ].reduce(R.mergeDeepRight) as any
    }

export const saveConfig = (valuePath: string[], value: string | Object, path: string) => {
    const conf = fs.readJSONSync(path)
    console.log('conf :', conf)
    const updated = R.set(R.lensPath(valuePath), value, conf)

    console.log('updated :', updated)
    fs.writeJSONSync(path, updated, { spaces: 2 })
}

export const loadConfig = (path: string = `${__dirname}/config-template/config.terrain.json`) =>
    config(fs.readJSONSync(path))