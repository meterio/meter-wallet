type NodeConfig = {
  name: string;
  url: string;
  genesis: Flex.Meter.Block;
};

type Referer = {
  url: string;
  title: string;
};

type Keystore = {
  address: string;
  crypto: object;
  id: string;
  version: number;
};

declare namespace entities {
  type Activity<T extends "tx" | "cert"> = {
    id?: number;
    type: T;
    createdTime: number;
    referer: Referer;
    closed: number;
    data: T extends "tx"
      ? Activity.Tx
      : T extends "cert"
      ? Activity.Cert
      : never;
  };

  namespace Activity {
    type Tx = {
      id: string;
      message: Flex.Vendor.TxMessage;
      comment: string;
      timestamp: number;
      signer: string;
      estimatedFee: string;
      link: string;
      raw: string;
      receipt: Flex.Meter.Receipt | null;
    };

    type Cert = {
      message: Flex.Vendor.CertMessage;
      signer: string;
      timestamp: number;
      domain: string;
      signature: string;
    };
  }

  type Preference = {
    id?: number;
    key: string;
    value: any;
  };

  type Shortcut = {
    id?: number;
    title: string;
    href: string;
  };

  type Node = {
    id?: number;
  } & NodeConfig;

  type AccessRecord = {
    id?: number;
    baseUrl: string;
    lastAccessTime: number;
    tokens: string[];
    accessCount: number;
    pages: {
      title: string;
      href: string;
      favicon: string;
      accessCount: number;
    }[];
  };

  type Wallet = {
    id?: number;
    address: string;
    name: string;
    keystore: Keystore;
    createdTime: number;
  };

  type Jailed = {
    name:string;
    address: string;
    pubKey: string;
    totalPoints: number;
    bailAmount: string;
    jailedTime: number;
  }

  type Candidate = {
    name: string;
    description: string;
    ipAddr: string;
    address: string;
    totalVotes: number;
    commission: string;
    buckets: string[];
    owned: boolean;
    pubKey: string;
  };

  type Bucket = {
    id: string;
    owner: string;
    candidate: string;
    votes: string;
    bonus: string;
    totalVotes: string;
    createTime: string;
    matureTime: string;
    unbounded: boolean;
    option: string;
    nonce: number;
    autobid: number;

    owned: boolean;
    candidateName: string;
    matureFromNow: string;
    state: string;
    type?: string;
  };

  type DistMTRG = {
    addr:string;
    amount: string;
  }

  type AuctionSummary = {
    auctionID: string;
    startHeight: number;
    startEpoch: number;
    endHeight: number;
    endEpoch: number;
    releasedMTRG: string;
    reservedMTRG: string;
    reservedPrice: string;
    createTime: number;
    receivedMTR: string;
    actualPrice: string;
    auctionTxs: AuctionTx[];
    distMTRG: DistMTRG[];

    createdAt?: string;
  }

  type AuctionTx = {
    txid: string; 
    address: string; 
    amount: string; 
    type: string; 
    timestamp: number; 
    nonce: number;

    createdAt?: string;
  };

  type AuctionCB = {
    auctionID: string;
    startHeight: number;
    startEpoch: number;
    endHeight: number;
    endEpoch: number;
    releasedMTRG: string;
    reservedPrice: string;
    createTime: number;
    receivedMTR: string;
    auctionTxs: AuctionTx[];
  }
}

type DbEvent = {
  db: string;
  table: string;
  changes: Array<"creating" | "updating" | "deleting">;
};
type Beat = {
  number: number;
  id: string;
  parentID: string;
  timestamp: number;
  epoch:number;

  bloom: string;
  k: number;
  obsolete: boolean;
};

type SignTxOptions = {
  signer?: string;
  gas?: number;
  link?: string;
  comment?: string;
};

type SignCertOptions = {
  signer?: string;
};

type SignTxArg = {
  message: Flex.Vendor.TxMessage;
  options: SignTxOptions;
  referer: Referer;
};

type SignCertArg = {
  message: Flex.Vendor.CertMessage;
  options: SignCertOptions;
  referer: Referer;
};

// MQ payloads
type WindowAction = {
  windowId: number;
  action: "maximize" | "unmaximize" | "minimize";
};

type TabAction = {
  action: "close" | "new";
  url?: string;
};
