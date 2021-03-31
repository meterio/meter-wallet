import Vuex from "vuex";
import { sleep } from "@/common/sleep";
import { stringify } from "querystring";

namespace Store {
  export type Model = {
    chainHead: Flex.Meter.Status["head"];
    syncStatus: {
      progress: number;
      flag: "synced" | "syncing" | "outOfSync";
    };
    shortcuts: entities.Shortcut[];
    nodes: entities.Node[];
    wallets: entities.Wallet[];
    jaileds: entities.Jailed[];
    candidates: entities.Candidate[];
    buckets: entities.Bucket[];
    presentAuction: entities.AuctionCB;
  };
}

class Store extends Vuex.Store<Store.Model> {
  public static readonly UPDATE_CHAIN_HEAD = "updateChainHead";
  public static readonly UPDATE_SYNC_STATUS = "updateSyncStatus";
  public static readonly UPDATE_SHORTCUTS = "updateShortcuts";
  public static readonly UPDATE_NODES = "updateNodes";
  public static readonly UPDATE_WALLETS = "updateWallets";
  public static readonly UPDATE_CANDIDATES = "updateCandidates";
  public static readonly UPDATE_JAILEDS = "updateJaileds";
  public static readonly UPDATE_BUCKETS = "updateBuckets";
  public static readonly UPDATE_PRESENT_AUCTION = "updatePresentAuction";
  constructor() {
    super({
      state: {
        chainHead: flex.meter.status.head,
        syncStatus: {
          progress: flex.meter.status.progress,
          flag: "syncing"
        },
        shortcuts: [],
        nodes: [],
        wallets: [],
        candidates: [],
        jaileds: [],
        buckets: [],
        presentAuction: {auctionID:"", auctionTxs:[], receivedMTR:"",releasedMTRG:"",reservedPrice:"",startEpoch:0, startHeight:0, endEpoch:0,endHeight:0, createTime:0},
      },
      getters: {},
      mutations: {
        [Store.UPDATE_CHAIN_HEAD](state) {
          state.chainHead = flex.meter.status.head;
        },
        [Store.UPDATE_SYNC_STATUS](state, payload) {
          state.syncStatus = payload;
        },
        [Store.UPDATE_SHORTCUTS](state, payload) {
          state.shortcuts = payload;
        },
        [Store.UPDATE_NODES](state, payload) {
          state.nodes = payload;
        },
        [Store.UPDATE_WALLETS](state, payload) {
          state.wallets = payload;
        },
        [Store.UPDATE_CANDIDATES](state, payload) {
          // console.log('update candidate in store');
          state.candidates = payload.map(function(c: Flex.Meter.Candidate) {
            let t: entities.Candidate = {
              address: c.address,
              name: c.name,
              description: c.description,
              ipAddr: c.ipAddr,
              buckets: c.buckets,
              totalVotes: parseInt(c.totalVotes.toString()),
              commission: c.commission/1e7,
              pubKey: c.pubKey,

              owned: false
            };
            return t;
          });
        },
        [Store.UPDATE_JAILEDS](state, payload) {
          // console.log('update candidate in store');
          state.jaileds = payload.map(function(c: Flex.Meter.Jailed) {
            let t: entities.Jailed = {
              name: c.name,
              address: c.address,
              totalPoints: parseInt(c.totalPoints.toString()),
              bailAmount: c.bailAmount,
              pubKey: c.pubKey,
              jailedTime: c.jailedTime,
            };
            return t;
          });
        },
        [Store.UPDATE_BUCKETS](state, payload) {
          // console.log('update bucket in store');
          state.buckets = payload.map(function(b: any) {
            let t: entities.Bucket = {
              id: b.id,
              owner: b.owner,
              candidate: b.candidate,
              votes: b.value.toString(),
              totalVotes: '0',
              createTime: b.createTime,
              matureTime: b.matureTime,
              unbounded: b.unbounded,
              option: b.option,
              bonus: '0',
              nonce: b.nonce,
              autobid: b.autobid,

              owned: false,
              candidateName: "",
              matureFromNow: "",
              state: ""
            };
            if (b.bonusVotes) {
              t.bonus = b.bonusVotes.toString();
            }
            if (b.totalVotes) {
              t.totalVotes = b.totalVotes.toString();
            }

            return t;
          });
        },
        [Store.UPDATE_PRESENT_AUCTION](store, payload){
          // console.log('update present auction in store');
          store.presentAuction = payload;
        }

      }
    });
    // this.monitorAuction();
    // this.monitorCandidate();
    // this.monitorBucket();
    this.monitorChain();
    this.monitorDB();
  }
  private async monitorAuction() {
    for (;;) {
    try{
      const present = await flex.meter.auction();
      if (present){
        this.commit(Store.UPDATE_PRESENT_AUCTION, present);
      }
    }catch(e){
      // ignore error
    }
      await sleep(3000); // update every 3 seconds
    }
  }


  private async monitorCandidate() {
    for (;;) {
      try{
      const candidates = await flex.meter.candidates();
      if (candidates && candidates.length > 0) {
        this.commit(Store.UPDATE_CANDIDATES, candidates);
      }
    }catch(e){
      // ignore errors
    }
      await sleep(3000); // update every 3 seconds
    }
  }

  private async monitorBucket() {
    // console.log("START MONITOR BUCKET");
    for (;;) {
      try{
      const buckets = await flex.meter.buckets();
      // console.log(buckets);
      if (buckets && buckets.length > 0) {
        // console.log(buckets);
        this.commit(Store.UPDATE_BUCKETS, buckets);
      }
    }catch(e){
      // ignore errors
    }
      await sleep(3000); // update every 3 seconds
    }
  }

  private async monitorChain() {
    const ticker = flex.meter.ticker();
    let lastHeadId = flex.meter.status.head.id;
    let idleTimes = 0;
    for (;;) {
      const status = flex.meter.status;
      let flag: Store.Model["syncStatus"]["flag"];
      if (lastHeadId !== status.head.id) {
        lastHeadId = status.head.id;
        idleTimes = 0;
        this.commit(Store.UPDATE_CHAIN_HEAD, status.head);
      } else {
        idleTimes++;
      }

      if (status.progress === 1) {
        flag = "synced";
      } else if (idleTimes > 6) {
        flag = "outOfSync";
      } else {
        flag = "syncing";
      }
      this.commit(Store.UPDATE_SYNC_STATUS, {
        progress: status.progress,
        flag
      });
      await Promise.race([ticker.next(), sleep(5000)]);
    }
  }

  private async monitorDB() {
    const queryAndUpdateShortcuts = async () => {
      const shortcuts = await GDB.shortcuts.toArray();
      this.commit(Store.UPDATE_SHORTCUTS, shortcuts);
    };
    const queryAndUpdateNodes = async () => {
      const nodes = await GDB.nodes.toArray();
      this.commit(Store.UPDATE_NODES, nodes);
    };

    const queryAndUpdateWallets = async () => {
      const wallets = await BDB.wallets.toArray();
      this.commit(Store.UPDATE_WALLETS, wallets);
    };

    await queryAndUpdateShortcuts();
    await queryAndUpdateNodes();
    await queryAndUpdateWallets();

    GDB.nodes.subscribe(() => {
      queryAndUpdateNodes();
    });
    GDB.shortcuts.subscribe(() => {
      queryAndUpdateShortcuts();
    });
    BDB.wallets.subscribe(() => {
      queryAndUpdateWallets();
    });
  }
}

export default Store;
