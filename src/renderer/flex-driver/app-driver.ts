import { remote } from 'electron'
import { ipcCall, ipcServe } from '../ipc'
import { blake2b256 } from '@meterio/devkit/dist/cry/blake2b'
import UUID from 'uuid'
const wc = remote.getCurrentWebContents()

export class AppDriver implements Flex.Driver {
    public readonly genesis: Flex.Meter.Block
    public head: Flex.Meter.Status['head']
    constructor() {
        const nodeConfig = remote.getCurrentWindow()
            .webContents
            .getWebPreferences()
            .nodeConfig!

        this.genesis = nodeConfig.genesis
        const configId = blake2b256(JSON.stringify(nodeConfig)).toString('hex')
        const initialHead = remote.app.EXTENSION.knownHeads.get(configId)

        this.head = initialHead || {
            id: this.genesis.id,
            number: this.genesis.number,
            parentID: this.genesis.parentID,
            timestamp: this.genesis.timestamp,
            epoch: this.genesis.epoch,
        }
    }

    public pollHead(): Promise<Flex.Meter.Status['head']> {
        return this.callToHost('pollHead').then(h => {
            this.head = h
            return h
        })
    }
    public getBlock(revision: string | number): Promise<Flex.Meter.Block | null> {
        return this.callToHost('getBlock', revision)
    }
    public getTransaction(id: string): Promise<Flex.Meter.Transaction | null> {
        return this.callToHost('getTransaction', id)
    }
    public getReceipt(id: string): Promise<Flex.Meter.Receipt | null> {
        return this.callToHost('getReceipt', id)
    }
    public getAccount(addr: string, revision: string): Promise<Flex.Meter.Account> {
        return this.callToHost('getAccount', addr, revision)
    }
    public getCode(addr: string, revision: string): Promise<Flex.Meter.Code> {
        return this.callToHost('getCode', addr, revision)
    }
    public getStorage(addr: string, key: string, revision: string): Promise<Flex.Meter.Storage> {
        return this.callToHost('getStorage', addr, key, revision)
    }
    public getCandidates(): Promise<Flex.Meter.Candidate[]>{
        return this.callToHost('getCandidates')
    }
    public getJaileds(): Promise<Flex.Meter.Jailed[]>{
        return this.callToHost('getJaileds')
    }
    public getCandidate(addr:string): Promise<Flex.Meter.Candidate>{
        return this.callToHost('getCandidate', addr)
    }
     public getBucket(id:string): Promise<Flex.Meter.Bucket>{
        return this.callToHost('getBucket', id)
    }
 
    public getAuctionSummaries(): Promise<Flex.Meter.AuctionSummary[]>{
        return this.callToHost('getAuctionSummaries')
    }
    public getAuction(): Promise<Flex.Meter.Auction>{
        return this.callToHost('getAuction')
    }
    public getBuckets():Promise<Flex.Meter.Bucket[]>{
        return this.callToHost('getBuckets')
    }
    public getStakeholders():Promise<Flex.Meter.Stakeholder[]>{
        return this.callToHost('getStakeholders')
    }

    public explain(
        arg: Flex.Driver.ExplainArg,
        revision: string,
        cacheTies?: string[]
    ): Promise<Flex.Meter.VMOutput[]> {
        return this.callToHost('explain', arg, revision, cacheTies)
    }
    public filterEventLogs(arg: Flex.Driver.FilterEventLogsArg): Promise<Flex.Meter.Event[]> {
        return this.callToHost('filterEventLogs', arg)
    }
    public filterTransferLogs(arg: Flex.Driver.FilterTransferLogsArg): Promise<Flex.Meter.Transfer[]> {
        return this.callToHost('filterTransferLogs', arg)
    }
    public signTx(
        msg: Flex.Driver.SignTxArg,
        option: Flex.Driver.SignTxOption
    ): Promise<Flex.Vendor.TxResponse> {
        let delegationHandlerId
        if (option.delegationHandler) {
            delegationHandlerId = UUID.v4()
            const s = ipcServe(delegationHandlerId, async (fromWebContentsId, method, arg) => {
                try {
                    return await option.delegationHandler!(arg)
                } catch (err) {
                    throw { name: err.name, message: err.message }
                } finally {
                    s.stop()
                }
            })
        }
        return this.callToHost('signTx', msg, option, delegationHandlerId)
    }
    public signCert(
        msg: Flex.Vendor.CertMessage,
        option: Flex.Driver.SignCertOption
    ): Promise<Flex.Vendor.CertResponse> {
        return this.callToHost('signCert', msg, option)
    }
    public isAddressOwned(addr: string) {
        return this.callToHost('isAddressOwned', addr)
    }

    private async callToHost(method: string, ...args: any[]) {
        console.log("callToHost", method)
        try {
            return await ipcCall({
                webContentsId: wc.hostWebContents.id,
                channel: 'driver'
            }, method, args)
        } catch (err) {
            throw new ConnexError(err.message)
        }
    }
}

class ConnexError extends Error {
    constructor(msg: string) {
        super(msg)
    }
}

ConnexError.prototype.name = 'ConnexError'
