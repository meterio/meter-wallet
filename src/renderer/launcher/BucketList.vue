<template>
  <v-layout column align-center>
    <v-layout column style="max-width: 1000px; width: 100%">
      <div class="pa-3"></div>
    </v-layout>
    <h3 class="pa-3">Staking Buckets</h3>
    <v-card>
      <v-card-title>
        <v-select
          :items="bucketFilters"
          small
          v-model="filterSelection"
          label="Select inputs"
          class="input-group--focused"
          item-value="text"
        ></v-select>

        <router-link :to="{ name: 'create-vote' }">
          <v-btn depressed small color="primary">Create vote</v-btn>
        </router-link>
        <v-btn flat icon small color="green" v-on:click.native="refresh">
          <v-icon>cached</v-icon>
        </v-btn>

        <v-text-field
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
        ></v-text-field>
      </v-card-title>
      <div v-if="filteredBuckets.length > 0">
        <v-data-table
          :headers="headers"
          :items="filteredBuckets"
          :search="search"
          :rows-per-page-items="rowsPerPage"
        >
          <template slot="items" slot-scope="props">
            <td>
              <router-link
                :to="{ name: 'bucket', params: { id: props.item.id } }"
                >{{ props.item.id | shortID }}</router-link
              >
            </td>
            <td>{{ props.item.owner | shortAddr }}</td>
            <td>{{ props.item.candidate | shortAddr }}</td>
            <td>{{ props.item.candidateName }}</td>
            <td>
              <Amount sym="MTRG">{{ props.item.totalVotes }}</Amount>
            </td>
            <td>{{ props.item.state }}</td>
            <td>{{ props.item.matureFromNow }}</td>
            <td>
              <div
                v-if="
                  props.item.candidate ==
                  '0x0000000000000000000000000000000000000000'
                "
              >
                <router-link
                  tag="span"
                  :to="{
                    name: 'delegate',
                    params: { id: props.item.id, amount: props.item.votes },
                  }"
                >
                  <v-btn flat small outline color="teal">delegate</v-btn>
                </router-link>
                <router-link
                  v-if="!props.item.unbounded"
                  tag="span"
                  :to="{
                    name: 'unbound',
                    params: { id: props.item.id, amount: props.item.votes },
                  }"
                >
                  <v-btn flat small outline color="grey">unbound</v-btn>
                </router-link>
              </div>
              <div v-else>
                <router-link
                  tag="span"
                  :to="{
                    name: 'undelegate',
                    params: { id: props.item.id, amount: props.item.votes },
                  }"
                >
                  <v-btn flat small outline color="indigo">undelegate</v-btn>
                </router-link>
              </div>
            </td>
          </template>
        </v-data-table>
      </div>
    </v-card>
    <v-spacer />
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Emit } from "vue-property-decorator";
import { State } from "vuex-class";
import { mapMutations } from "vuex";

import env from "@/env";
import BigNumber from "bignumber.js";
const moment = require("moment");

@Component
export default class BucketList extends Vue {
  @State
  wallets!: entities.Wallet[];

  @State
  buckets!: entities.Bucket[];

  @State
  candidates!: entities.Candidate[];

  filterSelection = "buckets owned by me";

  get ownedBuckets() {
    return this.buckets
      .filter((b) => b.owner in this.walletMap)
      .map((b) => {
        b.owned = true;
        b.candidateName = this.candidateNameMap[b.candidate] || "nobody";
        b.matureFromNow = b.unbounded ? moment.utc(b.matureTime).fromNow() : "";
        b.state = b.unbounded ? "unbounded" : "created";
        return b;
      });
  }
  get votedBuckets() {
    return this.buckets
      .filter((b) => b.candidate in this.walletMap)
      .map((b) => {
        b.owned = false;
        b.candidateName = this.candidateNameMap[b.candidate] || "nobody";
        b.matureFromNow = b.unbounded ? moment.utc(b.matureTime).fromNow() : "";
        b.state = b.unbounded ? "unbounded" : "created";
        return b;
      });
  }

  get filteredBuckets() {
    return this.filterSelection == "buckets owned by me"
      ? this.ownedBuckets
      : this.votedBuckets;
  }

  get walletMap() {
    const walletMap = this.wallets.reduce((map: Record<string, boolean>, w) => {
      map[w.address] = true;
      return map;
    }, {});
    return walletMap;
  }

  get candidateNameMap() {
    let map: Record<string, string> = {};
    for (var i in this.candidates) {
      const c = this.candidates[i];
      map[c.address] = c.name;
    }
    return map;
  }

  data() {
    return {
      search: "",
      myBuckets: [],
      filterSelection: "buckets owned by me",
      bucketFilters: [
        { text: "buckets owned by me" },
        { text: "buckets voted to me" },
      ],
    };
  }

  logoUrl = env.logoUrl;
  rowsPerPage = [50, 100, 200, { text: "All", value: -1 }];

  headers = [
    { text: "ID", value: "id", sortable: true },
    { text: "Owner Address", value: "owner", sortable: true },
    { text: "Candidate Address", value: "candidate", sortable: true },
    { text: "Name", value: "candidateName", sortable: true },
    { text: "Total Votes", value: "totalVotes", sortable: true },
    { text: "State", value: "state", sortable: true },
    { text: "Mature", value: "matureFromNow", sortable: true },
    { text: "Action", value: "action", sortable: true },
  ];

  async refresh() {
    const buckets = await flex.meter.buckets();
    this.$store.commit("updateBuckets", buckets);
  }

  async created() {
    await this.refresh();
  }
}
</script>

<style>
table.v-table thead td:not(:nth-child(1)),
table.v-table tbody td:not(:nth-child(1)),
table.v-table thead th:not(:nth-child(1)),
table.v-table tbody th:not(:nth-child(1)) {
  padding: 4px 8px !important;
  /* text-align: center; */
}
table.v-table thead td:first-child,
table.v-table tbody td:first-child,
table.v-table thead th:first-child,
table.v-table tbody th:first-child {
  padding: 0 15px !important;
  text-align: center;
}
</style>