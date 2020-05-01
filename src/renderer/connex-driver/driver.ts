import { DriverNoVendor } from '@meterio/flex-framework/dist/driver/driver-no-vendor'
import { remote } from 'electron'
import { ipcServe, ipcCall } from '../ipc'
import { SimpleNet } from '@meterio/flex-framework/dist/driver/simple-net'
import { blake2b256 } from '@meterio/devkit/dist/cry/blake2b'
import { Throttle } from './throttle'

export class Driver extends DriverNoVendor {
    private readonly configId: string
    constructor() {

        const configId = blake2b256(JSON.stringify(NODE_CONFIG)).toString('hex')
        const knownHead = remote.app.EXTENSION.knownHeads.get(configId)
        super(
            new SimpleNet(NODE_CONFIG.url, 30 * 1000, 60 * 1000),
            NODE_CONFIG.genesis,
            knownHead)
        this.configId = configId
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

}

