import { remote } from 'electron'
import { ipcCall, ipcServe } from '../ipc'
import { blake2b256 } from '@meterio/devkit/dist/cry/blake2b'
import UUID from 'uuid'
import { BridgeAPI, Capacity, Trade } from './bridge-api'
const wc = remote.getCurrentWebContents()

export class AppBridge implements BridgeAPI {
    constructor() {
    }

    public getCapacity(): Promise<Capacity[]>{
        return this.callToHost('getCapacity');
    }

    public getTrade(inboundTxHash:string):Promise<Trade>{
        return this.callToHost('getTrade', inboundTxHash)
    }

    private async callToHost(method: string, ...args: any[]) {
        console.log("callToHost", method)
        try {
            return await ipcCall({
                webContentsId: wc.hostWebContents.id,
                channel: 'driver'
            }, method, args)
        } catch (err) {
            throw new BridgeError(err.message)
        }
    }
}


class BridgeError extends Error {
    constructor(msg: string) {
        super(msg)
    }
}

BridgeError.prototype.name = 'BridgeError'