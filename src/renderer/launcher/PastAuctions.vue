<template>
  <v-layout column align-center justify-center>
    <h3 class="pa-3">Past Auctions</h3>
    <v-card>
      <v-card-title></v-card-title>
      <v-data-table
        :headers="headers"
        :items="auctions"
        :search="search"
        :rows-per-page-items="rowsPerPage"
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.auctionID | shortID }}</td>
          <td>{{ props.item.startHeight }} - {{ props.item.endHeight }}</td>
          <td>
            <Amount sym="MTR">{{ props.item.receivedMTR }}</Amount>
          </td>
          <td>
            <Amount sym="MTR">{{ props.item.actualPrice }}</Amount>
          </td>
          <td>
            <Amount sym="MTRG">{{
              props.item.releasedMTRG - props.item.leftoverMTRG
            }}</Amount>
          </td>
          <td>
            <Amount sym="MTRG">{{ props.item.leftoverMTRG }}</Amount>
          </td>
          <td>{{ props.item.createdAt }}</td>
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
export default class PastAuctions extends Vue {
  auctions: entities.AuctionSummary[] = [];

  search = "";
  rowsPerPage = [10, 20, { text: "All", value: -1 }];

  headers = [
    { text: "ID", value: "auctionID", sortable: true },
    { text: "Height Range", value: "heightRange", sortable: true },
    { text: "Received", value: "receivedMTR", sortable: true },
    { text: "Settlement Price", value: "actualPrice", sortable: true },
    { text: "Sold", value: "releasedMTRG", sortable: true },
    { text: "Leftover", value: "leftoverMTRG", sortable: true },
    { text: "Created At", value: "createTime", sortable: true },
  ];

  async created() {
    let data = await flex.meter.auctionSummaries();
    this.auctions = data.map((element) => {
      {
        let atxs: entities.AuctionTx[] = [];
        let dms: entities.DistMTRG[] = [];
        for (const atx of element.auctionTxs) {
          atxs.push({ ...atx });
        }
        for (const dm of element.distMTRG) {
          dms.push({ ...dm });
        }
        let t: entities.AuctionSummary = {
          ...element,
          auctionTxs: atxs,
          distMTRG: dms,
          createdAt: moment.unix(element.createTime).format("MM/DD hh:mm"),
        };
        return t;
      }
    });
  }
}
</script>
