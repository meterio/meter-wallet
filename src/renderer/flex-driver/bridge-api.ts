export interface Capacity{
    token: string;
    capacity: string; 
    used: string;
}

export interface Tx {
    network: string;
    eventType: string;
    hash: string;
    from: string;
    to: string;
    amount: string;
    token: string;
    status: string;
  
    blockHash?: string;
    blockNumber?: number;
  }
  
  export interface Trade {
    inboundTx: Tx;
    status: string;
  
    outboundTx?: Tx;
    fee?: string;
  }

export interface BridgeAPI{
     getCapacity():Promise<Capacity[]>;
     getTrade(inboundTxHash:string):Promise<Trade>;
}