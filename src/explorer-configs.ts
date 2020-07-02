import { nameOfNetwork } from './node-configs'

const explorers = [
    {
        name: 'insight',
        testUrl: 'https://insight.meter.io/#',
        url: 'https://insight.meter.io/#',
        paths: {
            tx: '/txs/%s',
            block: '/blocks/%s',
            account: '/accounts/%s',
            transfer: '/accounts/%s/transfers',
            search: '/search?q=%s'
        }
    }
]

export function getExploreUrl(name: 'insight' , path: string, params: string) {
    const networkName = nameOfNetwork(NODE_CONFIG.genesis.id)
    const isMain = networkName === 'mainnet'
    const isMustInsight = ['mainnet', 'testnet'].indexOf(networkName) < 0
    let explorer: any
    if (isMustInsight) {
        explorer = explorers[0]
    } else {
        explorer = explorers.find(e => e.name === name)
    }
    const baseUrl = isMain ? explorer.url : explorer.testUrl
    const pathTemp: string = explorer.paths[path] as string

    if (pathTemp) {
        return baseUrl + pathTemp.replace('%s', params)
    } else {
        return ''
    }

}