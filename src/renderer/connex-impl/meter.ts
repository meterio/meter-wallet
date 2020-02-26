import { createAccountVisitor } from "./account-visitor";
import { createBlockVisitor } from "./block-visitor";
import { createTxVisitor } from "./tx-visitor";
import { createFilter } from "./filter";
import cloneDeep from "lodash.clonedeep";
import * as V from "@/common/validator";
import { ensure } from "./ensure";
import { createCandidateVisitor } from "./candidate-visitor";
import { createBucketVisitor } from "./bucket-visitor";
import { createStakeholderVisitor } from "./stakeholder-visitor";
import { createDelegateVisitor } from "./delegate-visitor";
import { net } from "electron";

export function create(client: Client): Connex.Meter {
  const genesis = cloneDeep(client.genesis);
  return {
    get genesis() {
      return genesis;
    },
    get status() {
      return {
        head: { ...client.head },
        progress: client.progress
      };
    },
    candidate(addr: string) {
      return createCandidateVisitor(client, addr);
    },
    candidateList() {
      return client.getCandidateList();
    },

    bucket(id: string) {
      return createBucketVisitor(client, id);
    },
    bucketList() {
      return client.getBucketList();
    },

    stakeholder(addr: string) {
      return createStakeholderVisitor(client, addr);
    },
    stakeholderList() {
      return client.getStakeholderList();
    },
    delegate(addr: string) {
      return createDelegateVisitor(client, addr);
    },
    delegateList() {
      return client.getDelegateList();
    },

    auctionPresent(){
      return client.getAuctionPresent();
    },
    auctionSummaryList(){
      return client.getAuctionSummaryList();
    },
    
    ticker: () => {
      let lastHeadId = client.head.id;
      return {
        next: async () => {
          if (lastHeadId !== client.head.id) {
            lastHeadId = client.head.id;
            return;
          }
          await client.nextTick();
          lastHeadId = client.head.id;
        }
      };
    },
    account: addr => {
      ensure(V.isAddress(addr), `'addr' expected address type`);
      return createAccountVisitor(client, addr);
    },
    block: revision => {
      if (typeof revision === "string") {
        ensure(
          V.isBytes32(revision),
          `'revision' expected bytes32 in hex string`
        );
      } else if (typeof revision === "number") {
        ensure(
          V.isUint32(revision),
          `'revision' expected non-neg 32bit integer`
        );
      } else if (typeof revision === "undefined") {
        revision = client.head.id;
      } else {
        ensure(false, `'revision' has invalid type`);
      }
      return createBlockVisitor(client, revision);
    },
    transaction: id => {
      ensure(V.isBytes32(id), `'id' expected bytes32 in hex string`);
      return createTxVisitor(client, id);
    },
    filter: kind => {
      return createFilter(client, kind);
    },
    explain: () => {
      const opts: {
        caller?: string;
        gas?: number;
        gasPrice?: string;
      } = {};
      return {
        caller(addr) {
          ensure(V.isAddress(addr), `'addr' expected address type`);
          opts.caller = addr;
          return this;
        },
        gas(gas) {
          ensure(
            gas >= 0 && Number.isSafeInteger(gas),
            `'gas' expected non-neg safe integer`
          );
          opts.gas = gas;
          return this;
        },
        gasPrice(gp) {
          ensure(
            V.isDecString(gp) || V.isHexString(gp),
            `'gasPrice' expected integer in hex/dec string`
          );
          opts.gasPrice = gp;
          return this;
        },
        execute(clauses) {
          ensure(Array.isArray(clauses), `'clauses' expected array`);
          clauses.forEach((c, i) => {
            ensure(
              c.to === null || V.isAddress(c.to),
              `'clauses#${i}.to' expected null or address`
            );
            if (typeof c.value === "number") {
              ensure(
                Number.isSafeInteger(c.value) && c.value >= 0,
                `'clauses#${i}.value' expected non-neg safe integer`
              );
            } else {
              ensure(
                V.isHexString(c.value) || V.isDecString(c.value),
                `'clauses#${i}.value' expected integer in hex/dec string`
              );
            }
            ensure(
              !c.data || V.isHexBytes(c.data),
              `'clauses#${i}.data' expected bytes in hex string`
            );
          });
          let cs = clauses.map(c => ({
            to: c.to,
            value: c.value.toString(),
            token: c.token || 0,
            data: c.data || ""
          }));
          return client
            .explain(cs, { ...opts }, client.head.id)
            .then(cloneDeep);
        }
      };
    }
  };
}
