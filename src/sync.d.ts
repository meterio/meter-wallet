type NodeConfig = {
  name: string;
  url: string;
  genesis: Connex.Meter.Block;
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
      message: Connex.Vendor.SigningService.TxMessage;
      comment: string;
      timestamp: number;
      signer: string;
      estimatedFee: string;
      link: string;
      raw: string;
      receipt: Connex.Meter.Receipt | null;
    };

    type Cert = {
      message: Connex.Vendor.SigningService.CertMessage;
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

interface Client {
  readonly genesis: Connex.Meter.Block;
  readonly head: Connex.Meter.Status["head"];
  readonly progress: number;

  nextTick(): Promise<void>;

  explain(
    clauses: Connex.Meter.Clause[],
    options: {
      caller?: string;
      gas?: number;
      gasPrice?: string;
    },
    rev: string
  ): Promise<Connex.Meter.VMOutput[]>;

  getAccount(addr: string, rev: string): Promise<Connex.Meter.Account>;
  getCode(addr: string, rev: string): Promise<Connex.Meter.Code>;
  getStorage(
    addr: string,
    key: string,
    rev: string
  ): Promise<Connex.Meter.Storage>;
  call(
    clause: Connex.Meter.Clause,
    options: {
      caller?: string;
      gas?: number;
      gasPrice?: string;
    },
    rev: string
  ): Promise<Connex.Meter.VMOutput>;

  getBlock(rev: string | number): Promise<Connex.Meter.Block | null>;
  getTx(id: string): Promise<Connex.Meter.Transaction | null>;
  getReceipt(id: string): Promise<Connex.Meter.Receipt | null>;
  filter<T extends "event" | "transfer">(
    kind: T,
    body: {
      range: Connex.Meter.Filter.Range;
      order: "asc" | "desc";
      criteriaSet: Connex.Meter.Filter.Criteria<T>[];
      options: { offset: number; limit: number };
    }
  ): Promise<Connex.Meter.Filter.Result<T>>;

  beat(b: Beat): void;
  txer: {
    send(id: string, raw: string): void;
    status(id: string): "sending" | "sent" | "error" | undefined;
  };
  discoverNode(url: string): Promise<Connex.Meter.Block>;

  getCandidateList(): Promise<Connex.Meter.Candidate[]>;
  getCandidate(addr: string): Promise<Connex.Meter.Candidate | null>;
  getStakeholderList(): Promise<Connex.Meter.Stakeholder[]>;
  getStakeholder(addr: string): Promise<Connex.Meter.Stakeholder | null>;
  getBucketList(): Promise<Connex.Meter.Bucket[]>;
  getBucket(id: string): Promise<Connex.Meter.Bucket | null>;
  getDelegateList(): Promise<Connex.Meter.Delegate[]>;
  getDelegate(addr: string): Promise<Connex.Meter.Delegate | null>;
  getAuctionPresent(): Promise<Connex.Meter.AuctionCB>;
  getAuctionSummaryList(): Promise<Connex.Meter.AuctionSummary[]>;
}

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
  message: Connex.Vendor.SigningService.TxMessage;
  options: SignTxOptions;
  referer: Referer;
};

type SignCertArg = {
  message: Connex.Vendor.SigningService.CertMessage;
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
