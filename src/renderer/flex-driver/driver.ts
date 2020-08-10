import { DriverNoVendor } from '@meterio/flex-framework/dist/driver/driver-no-vendor'
import { remote } from 'electron'
import { ipcServe, ipcCall } from '../ipc'
import { SimpleNet } from '@meterio/flex-framework/dist/driver/simple-net'
import { blake2b256 } from '@meterio/devkit/dist/cry/blake2b'
import { Throttle } from './throttle'

export class Driver extends DriverNoVendor {
    private readonly configId: string
    constructor() {


        /*
        const nodeConfig = remote.getCurrentWindow()
                .webContents
                .getWebPreferences()
                .nodeConfig
                */
        const configId = blake2b256(JSON.stringify(NODE_CONFIG)).toString('hex')
        const knownHead = remote.app.EXTENSION.knownHeads.get(configId)
        super(
            new SimpleNet(NODE_CONFIG.url, 30 * 1000, 60 * 1000),
            NODE_CONFIG.genesis,
            knownHead)
        this.configId = configId
        this.serveForApp()
    }

    public pollHead() {
        return this._pollHead().then(h => {
            remote.app.EXTENSION.knownHeads.set(this.configId, h)
            return h
        })
    }
    public _pollHead() {
        return super.pollHead()
    }
    public signTx(
        msg: Flex.Driver.SignTxArg,
        option: Flex.Driver.SignTxOption
    ): Promise<Flex.Driver.SignTxResult> {
        if (!window.VENDOR) {
            throw new Error('not ready')
        }
        const wc = remote.getCurrentWebContents()
        return window.VENDOR.signTx(msg, option, {
            webContentsId: wc.id,
            referer: {
                title: wc.getTitle(),
                url: wc.getURL()
            }
        })
    }
    public signCert(
        msg: Flex.Vendor.CertMessage,
        options: Flex.Driver.SignCertOption
    ): Promise<Flex.Vendor.CertResponse> {
        if (!window.VENDOR) {
            throw new Error('not ready')
        }
        const wc = remote.getCurrentWebContents()
        return window.VENDOR.signCert(msg, options, {
            webContentsId: wc.id,
            referer: {
                title: wc.getTitle(),
                url: wc.getURL()
            }
        })
    } 

    public isAddressOwned(addr: string) {
        if (!window.VENDOR) {
            throw new Error('not ready')
        }
        return window.VENDOR.isAddressOwned(addr)
    }

    private serveForApp() {
        const throttleMap = new Map<number, Throttle>()
        ipcServe('driver', async (fromWebContentsId, method, args) => {
            try {
                const wc = remote.webContents.fromId(fromWebContentsId)
                const fn = (this as any)[method]
                if (fn instanceof Function) {
                    if (method === 'signTx') {
                        if (!window.VENDOR) {
                            throw new Error('not ready')
                        }
                        let delegationHandler
                        if (args[2]) {
                            delegationHandler = (arg: any) => {
                                return ipcCall({
                                    webContentsId: fromWebContentsId,
                                    channel: args[2]
                                }, '', arg)
                            }
                        }
                        return await window.VENDOR.signTx(
                            args[0],
                            { ...args[1], delegationHandler },
                            {
                                webContentsId: fromWebContentsId,
                                referer: {
                                    title: wc.getTitle(),
                                    url: wc.getURL()
                                }
                            })
                    } else if (method === 'signCert') {
                        if (!window.VENDOR) {
                            throw new Error('not ready')
                        }
                        return await window.VENDOR.signCert(args[0], args[1], {
                            webContentsId: wc.id,
                            referer: {
                                title: wc.getTitle(),
                                url: wc.getURL()
                            }
                        })
                    } else if (method === 'pollHead') {
                        return await this._pollHead()
                    } else if (method === 'getBlock'){
                        console.log('getting block')
                        for (let n of args){
                            console.log('args[0]:', args[0])
                        }
                        
                        return this.getBlock(args[0]);
                    } else if (method==='getTransaction'){
                        return this.getTransaction(args[0])
                    } else if (method === 'getReceipt'){
                        return this.getReceipt(args[0])
                    } else if (method ==='getAccount'){
                        return this.getAccount(args[0], args[1]);
                    } else if (method ==='getCandidates'){
                        return this.getCandidates();
                    } else if (method ==='getStakeholders'){
                        return this.getStakeholders();
                    } else if (method ==='getBuckets'){
                        return this.getBuckets();
                    } else if (method ==='getAuction'){
                        return this.getAuction();
                    } else if (method ==='getAuctionSummaries'){
                        return this.getAuctionSummaries();
                    } else {
                        let th = throttleMap.get(fromWebContentsId)
                        if (!th) {
                            th = new Throttle(15, 200)
                            throttleMap.set(fromWebContentsId, th)
                            wc.once('destroyed', () => {
                                throttleMap.delete(fromWebContentsId)
                            })
                        }
                        const r = th.throttle(() => fn.apply(this, args))
                        if (th.concurrent >= th.softLimit && th.concurrent < th.hardLimit) {
                            wc.executeJavaScript(
                                `console.warn('flex: request pending (concurrent soft limit ${th.softLimit})')`)
                                // tslint:disable-next-line: no-console
                                .catch(err => console.warn('log to webview', err))
                        }
                        return await r
                    }
                }
                throw { name: 'Error', message: 'not impl' }
            } catch (err) {
                // it's important to transform error into plain object,
                // since electron's ipc will json/unjson arguments
                throw { name: err.name, message: err.message }
            }
        })
    }
}

