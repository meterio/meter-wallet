<template>
  <v-layout column pa-5>
    <h3 class="pa-3">Present Auction</h3>
    <v-card>
      <v-card-text>
        <v-layout justify-space-between>
          <div>
            <div class="my-2">
              Auction amount:
              <Amount sym="MTRG">{{ presentAuction.releasedMTRG }}</Amount>
            </div>
            <div class="my-2">
              Received total bids:
              <Amount sym="MTR">{{ presentAuction.receivedMTR }}</Amount>
            </div>
          </div>

          <div>
            <div class="my-2">
              Height Range: {{ presentAuction.startHeight }} -
              {{ presentAuction.endHeight }}
            </div>
            <div class="my-2">Current Height: {{ chainHead.number }}</div>
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
      console.log(tx);

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
  }

  jumpToInsight(addr: string) {
    BUS.$emit("open-tab", {
      href: `https://insight.meter.io/#/accounts/${addr}`,
      mode: "append-active",
    });
  }

  async refresh() {
    const present = await flex.meter.auction();
    this.$store.commit("updatePresentAuction", present);
  }
}
</script>

<style scoped>
.v-input.v-text-field {
  padding-top: 0;
  margin-top: 0;
}
</style>