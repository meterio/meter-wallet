<template>
  <v-layout column align-center justify-center>
    <h3 class="pa-3">Present Auction</h3>
    <v-card>
      <v-card-text class="pr-3 pl-3 pt-4 pb-0">
        <v-layout justify-space-between>
          <div>
            Auction amount:
            <Amount sym="MTRG">{{presentAuction.releasedMTRG}}</Amount>
          </div>
          <div>
            Received total bids:
            <Amount sym="MTR">{{presentAuction.receivedMTR}}</Amount>
          </div>
        </v-layout>
        <v-layout class="pt-2 pa-0" justify-space-between v-if="isPast">
          <div>Start Height: {{presentAuction.startHeight}}</div>
          <div>Closing Height: {{presentAuction.endHeight}}</div>
          <div>Current Height: {{chainHead.number}}</div>
        </v-layout>

        <v-layout class="pt-2 pa-0" justify-space-between v-if="!isPast">
          <div>Height Range: {{presentAuction.startHeight}} - {{presentAuction.endHeight}}</div>
          <div>Current Height: {{chainHead.number}}</div>
        </v-layout>
      </v-card-text>

      <v-card-title>
        <v-layout justify-space-between>
          <router-link :to="{ name: 'auction-bid' }" class="mt-3">
            <v-btn depressed small color="primary" class="ml-0">Auction Bid</v-btn>
          </router-link>
          <router-link :to="{ name: 'past-auctions' }" class="mt-3">
            <v-btn depressed small outline color="primary">Past Auctions</v-btn>
          </router-link>
          <v-btn flat icon small color="green" class="mt-3" v-on:click.native="refresh">
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
          <td>{{props.item.addr}}</td>
          <td>
            <Amount sym="MTR">{{ props.item.amount }}</Amount>
          </td>
          <td>{{ props.item.count }}</td>
          <td>{{ props.item.createdAt}}</td>
        </template>
      </v-data-table>
    </v-card>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import Amount from "@/src/renderer/components/Amount.vue";
import env from "@/env";

const moment = require("moment");

@Component
export default class PresentAuction extends Vue {
  @State
  presentAuction!: entities.AuctionCB;

  @State
  chainHead!: Flex.Meter.Status["head"];

  search = "";
  rowsPerPage = [50, 100, 200, { text: "All", value: -1 }];

  get progress() {
    const start = this.presentAuction.startHeight;
    const end = this.presentAuction.endHeight;
    const cur = this.chainHead.number;
    const p = Math.floor((100 * (cur - start)) / (end - start));
    return p;
  }

  get auctionTxs() {
    return this.presentAuction.auctionTxs.map(tx => {
      tx.createdAt = moment.unix(tx.lastTime).format("MM/DD hh:mm");
      return tx;
    });
  }

  get isPast() {
    return this.chainHead.number > this.presentAuction.endHeight;
  }

  headers = [
    { text: "Address", value: "addr", sortable: true },
    { text: "Amount", value: "amount", sortable: true },
    { text: "Tx count", value: "count", sortable: true },
    { text: "Created At", value: "createTime", sortable: true }
  ];

  async created() {
    await this.refresh();
  }

  jumpToInsight(addr: string) {
    BUS.$emit("open-tab", {
      href: `https://insight.meter.io/#/accounts/${addr}`,
      mode: "append-active"
    });
  }

  async refresh() {
    const present = await flex.meter.auction();
    this.$store.commit("updatePresentAuction", present);
  }
}
</script>
