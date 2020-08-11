import { remote } from 'electron'
import { ipcServe  } from '../ipc'
import {Net} from "@meterio/flex-framework/dist/driver/interfaces"
import {nameOfNetwork, bridgeBase} from "@/node-configs"

export class Bridge implements  Meter.BridgeAPI{
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

    public getCapacity():Promise<Meter.Capacity[]>{
        console.log('bridge getCapacity')
        const networkName = nameOfNetwork(NODE_CONFIG.genesis.id)
        const base = bridgeBase(networkName);
        console.log('base: ', base)

        return this.httpGet(`${base}/gauges/capacity`);
    }

    public getTrade(inboundTxHash:string):Promise<Meter.Trade>{
        const networkName = nameOfNetwork(NODE_CONFIG.genesis.id)
        const base = bridgeBase(networkName);
 
        return this.httpGet(`${base}/trades/${inboundTxHash}`)
    }

    public getTrades(inboundAddr:string):Promise<Meter.Trade[]>{
        const networkName = nameOfNetwork(NODE_CONFIG.genesis.id)
        const base = bridgeBase(networkName);
 
        console.log("url = "+`${base}/trades/from/${inboundAddr}`)
        return this.httpGet(`${base}/trades/from/${inboundAddr}`)
    }

    private serveForApp() {
        ipcServe('bridge', async (fromWebContentsId, method, args) => {
            try {
                const wc = remote.webContents.fromId(fromWebContentsId)
                const fn = (this as any)[method]
                if (fn instanceof Function) {
                    if (method === 'getCapacity') {
                        console.log('calling getCapacity')
                        return await this.getCapacity();
                    } else if (method === 'getTrade'){
                        console.log('calling get Trade', args[0])
                        return await this.getTrade(args[0])
                    } else if (method === 'getTrades'){
                        console.log('calling getTrades')
                        return await this.getTrades(args[0])
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

