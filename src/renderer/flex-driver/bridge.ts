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

    public getPairs():Promise<Meter.Pair[]>{
        const networkName = nameOfNetwork(NODE_CONFIG.genesis.id)
        const base = bridgeBase(networkName);

        return this.httpGet(`${base}/pairs`);
    }

    public getCapacities():Promise<Meter.Capacity[]>{
        const networkName = nameOfNetwork(NODE_CONFIG.genesis.id)
        const base = bridgeBase(networkName);

        return this.httpGet(`${base}/pairs/capacity`);
    }

    public getTradesByInboundHash(inboundTxHash:string):Promise<Meter.Trade>{
        const networkName = nameOfNetwork(NODE_CONFIG.genesis.id)
        const base = bridgeBase(networkName);
 
        return this.httpGet(`${base}/trades/${inboundTxHash}`)
    }

    public getTradesByInboundAddr(inboundAddr:string):Promise<Meter.Trade[]>{
        const networkName = nameOfNetwork(NODE_CONFIG.genesis.id)
        const base = bridgeBase(networkName);
 
        return this.httpGet(`${base}/trades/from/${inboundAddr}`)
    }

    private serveForApp() {
        ipcServe('bridge', async (fromWebContentsId, method, args) => {
            try {
                const wc = remote.webContents.fromId(fromWebContentsId)
                const fn = (this as any)[method]
                if (fn instanceof Function) {
                    if (method === 'getCapacities') {
                        return await this.getCapacities();
                    } else if (method === 'getTradesByInboundHash'){
                        console.log('calling get Trade', args[0])
                        return await this.getTradesByInboundHash(args[0])
                    } else if (method === 'getTradesByInboundAddr'){
                        console.log('calling getTrades')
                        return await this.getTradesByInboundAddr(args[0])
                    } else if (method === 'getPairs'){
                        return await this.getPairs();
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

