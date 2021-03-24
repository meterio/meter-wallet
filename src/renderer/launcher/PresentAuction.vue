<template>
  <v-layout column pa-5>
    <h3 class="pa-3">Present Auction</h3>
    <v-card>
      <v-card-text class="mb-0">
        <v-layout justify-space-between>
          <div>
            <div class="my-2">
              MTRG on Auction:
              <Amount sym="MTRG">{{ presentAuction.releasedMTRG }}</Amount>
            </div>
            <div class="my-2">
              Received bids:
              <Amount sym="MTR">{{ presentAuction.receivedMTR }}</Amount>
            </div>
            <div class="my-2">
              Estimate Price: <Amount sym="MTR">{{ estPrice }}</Amount>
            </div>
          </div>

          <div>
            <div class="my-2">
              Epoch Range: {{ presentAuction.endEpoch }} -
              {{ presentAuction.endEpoch + 24 }}
            </div>
            <div class="my-2">Current Epoch: {{ chainHead.epoch }}</div>
            <div class="my-2">
              Est. End Time: in
              {{ leftoverEpoch }} hour{{ leftoverEpoch > 1 ? "s" : "" }}
            </div>
          </div>
        </v-layout>
      </v-card-text>

      <v-card-title>
        <v-layout justify-space-between>
          <router-link :to="{ name: 'auction-bid' }">
            <v-btn depressed small color="primary" class="ml-0"
              >Auction Bid</v-btn
            >
          </router-link>
          <router-link :to="{ name: 'past-auctions' }">
            <v-btn depressed small outline color="primary">Past Auctions</v-btn>
          </router-link>
          <v-btn flat icon small color="green" v-on:click.native="refresh">
            <v-icon>cached</v-icon>
          </v-btn>

          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-layout>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="auctionTxs"
        :search="search"
        :rows-per-page-items="rowsPerPage"
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.address }}</td>
          <td>
            <Amount sym="MTR">{{ props.item.amount }}</Amount>
          </td>
          <td>{{ props.item.type }}</td>
          <td>{{ props.item.createdAt }}</td>
        </template>
      </v-data-table>
    </v-card>
  </v-layout>
</template>
<script lang="ts">
import BigNumber from "bignumber.js";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";

const moment = require("moment");

@Component
export default class PresentAuction extends Vue {
  @State
  presentAuction!: entities.AuctionCB;

  @State
  chainHead!: Flex.Meter.Status["head"];

  search = "";
  rowsPerPage = [20, 50, { text: "All", value: -1 }];
  timer: NodeJS.Timeout = {} as any;

  get estPrice() {
    return new BigNumber(this.presentAuction.receivedMTR)
      .dividedBy(this.presentAuction.releasedMTRG)
      .times(1e18)
      .toFixed();
  }
  get leftoverEpoch() {
    return this.presentAuction.endEpoch + 24 - this.chainHead.epoch;
  }

  get progress() {
    const start = this.presentAuction.startHeight;
    const end = this.presentAuction.endHeight;
    const cur = this.chainHead.number;
    const p = Math.floor((100 * (cur - start)) / (end - start));
    return p;
  }

  get auctionTxs() {
    return this.presentAuction.auctionTxs.map((tx) => {
      tx.createdAt = moment.unix(tx.timestamp).format("MM/DD hh:mm");
      return tx;
    });
  }

  headers = [
    { text: "Address", value: "address", sortable: true },
    { text: "Amount", value: "amount", sortable: true },
    { text: "Type", value: "type", sortable: true },
    { text: "Created At", value: "createdAt", sortable: true },
  ];

  async created() {
    await this.refresh();
    this.startInterval();
  }

  async destroyed() {
    this.stopInterval();
  }

  jumpToInsight(addr: string) {
    BUS.$emit("open-tab", {
      href: `https://insight.meter.io/#/accounts/${addr}`,
      mode: "append-active",
    });
  }

  async refresh() {
    console.log("refresh present auction");
    const present = await flex.meter.auction();
    this.$store.commit("updatePresentAuction", present);
  }

  startInterval() {
    clearInterval(this.timer);
    const self = this;
    this.timer = setInterval(function () {
      self.refresh();
    }, 5000);
  }

  stopInterval() {
    clearInterval(this.timer);
  }
}
</script>

<style scoped>
.v-input.v-text-field {
  padding-top: 0;
  margin-top: 0;
}
</style>