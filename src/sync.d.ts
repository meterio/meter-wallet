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

  type Candidate = {
    name: string;
    ipAddr: string;
    address: string;
    totalVotes: number;
    buckets: string[];
    owned: boolean;
  };

  type Bucket = {
    id: string;
    owner: string;
    candidate: string;
    votes: number;
    bonus: number;
    totalVotes: number;
    createTime: string;
    matureTime: string;
    unbounded: boolean;
    option: string;
    nonce: number;

    owned: boolean;
    candidateName: string;
    matureFromNow: string;
    state: string;
  };

  type AuctionSummary = {
    auctionID: string;
    startHeight: number;
    endHeight: number;
    releasedMTRG: string;
    reservedPrice: string;
    createTime: number;
    receivedMTR: string;
    actualPrice: string;
    leftoverMTRG:  string;

    createdAt: string;
  }

  type AuctionTx = {
    addr: string;
    amount: string;
    count: number;
    nonce: number;
    lastTime: number;

    createdAt: string;
  };

  type AuctionCB = {
    auctionID: string;
    startHeight: number;
    endHeight: number;
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
