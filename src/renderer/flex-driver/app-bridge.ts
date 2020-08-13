import { remote } from 'electron'
import { ipcCall, ipcServe } from '../ipc'
import { blake2b256 } from '@meterio/devkit/dist/cry/blake2b'
import UUID from 'uuid'
const wc = remote.getCurrentWebContents()

export class AppBridge implements Meter.BridgeAPI {
    constructor() {
    }

    public getCapacities(): Promise<Meter.Capacity[]>{
        console.log("app-bridge getCapacity")
        return this.callToHost('getCapacities');
    }

    public getPairs(): Promise<Meter.Pair[]>{
        return this.callToHost('getPairs');
    }

    public getTradesByInboundHash(inboundTxHash:string):Promise<Meter.Trade>{
        return this.callToHost('getTradesByInboundHash', inboundTxHash)
    }

    public getTradesByInboundAddr(inboundAddr:string): Promise<Meter.Trade[]>{
        return this.callToHost('getTradesByInboundAddr', inboundAddr)
    }

    private async callToHost(method: string, ...args: any[]) {
        console.log("callToHost", method, args)
        try {
            const result  =await ipcCall({
                webContentsId: wc.hostWebContents.id,
                channel: 'bridge'
            }, method, args)
            console.log('callToHost result:', result);
            return result;
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