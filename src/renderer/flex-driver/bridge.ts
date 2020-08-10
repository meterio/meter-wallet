import { DriverNoVendor } from '@meterio/flex-framework/dist/driver/driver-no-vendor'
import { remote } from 'electron'
import { ipcServe, ipcCall } from '../ipc'
import { SimpleNet } from '@meterio/flex-framework/dist/driver/simple-net'
import { blake2b256 } from '@meterio/devkit/dist/cry/blake2b'
import { Throttle } from './throttle'
import {BridgeAPI, Capacity, Trade} from "./bridge-api"
import {Net} from "@meterio/flex-framework/dist/driver/interfaces"

export class Bridge implements  BridgeAPI{
    constructor(
    private readonly net: Net,
    ) {
        this.serveForApp()
    }

    protected httpGet(path: string, query?: Record<string, string>) {
        return this.net.http('GET', path, {
          query,
        });
      }

    public getCapacity():Promise<Capacity[]>{
        return this.httpGet("http://localhost:8080/capacity");
    }

    public getTrade(inboundTxHash:string):Promise<Trade>{
        return this.httpGet(`http://localhost:8080/trade/${inboundTxHash}`)
    }

    private serveForApp() {
        ipcServe('bridge', async (fromWebContentsId, method, args) => {
            try {
                const wc = remote.webContents.fromId(fromWebContentsId)
                const fn = (this as any)[method]
                if (fn instanceof Function) {
                    if (method === 'getCapacity') {
                        return await this.getCapacity();
                    } else if (method === 'getTrade'){
                        return await this.getTrade(args[0])
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

