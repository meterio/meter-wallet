<template>
  <v-layout column pa-5>
    <h3 class="pa-3">Bucket List</h3>
    <v-card>
      <v-card-title>
        <v-layout justify-space-between>
          <v-select
            :items="bucketFilters"
            small
            v-model="filterSelection"
            label="Select inputs"
            class="input-group--focused"
            item-value="text"
            :style="{ maxWidth: '200px' }"
          ></v-select>

          <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            :style="{ maxWidth: '400px' }"
          ></v-text-field>

          <div>
            <v-progress-circular
              class="mr-2 mt-2"
              size="22"
              :width="2"
              indeterminate
              color="primary"
              v-if="loading"
            ></v-progress-circular>
            <v-btn
              flat
              icon
              small
              :style="{ marginTop: '20px' }"
              color="green"
              v-on:click.native="refresh"
            >
              <v-icon>cached</v-icon>
            </v-btn>
            <v-btn
              depressed
              color="primary"
              :style="{ marginTop: '20px' }"
              :to="{ name: 'create-vote' }"
            >
              <v-icon class="mr-1" :style="{ color: 'white' }">add</v-icon>
              Create vote</v-btn
            >
          </div>
        </v-layout>
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
            <td>
              <router-link
                v-if="props.item.candidateName != '-'"
                :to="{
                  name: 'candidate-detail',
                  params: { addr: props.item.candidate },
                }"
              >
                {{ props.item.candidateName }}
              </router-link>
            </td>
            <td>
              <Amount sym="MTRG">{{ props.item.totalVotes }}</Amount>
            </td>
            <td>{{ props.item.type }}</td>
            <td>
              {{
                props.item.unbounded
                  ? "Mature " + props.item.matureFromNow
                  : props.item.state
              }}
            </td>
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
                    params: { id: props.item.id },
                  }"
                >
                  <v-btn flat small outline color="teal">delegate</v-btn>
                </router-link>
              </div>
              <div v-else>
                <!--
                <v-btn
                  flat
                  small
                  outline
                  color="grey"
                  v-if="!props.item.unbounded"
                  tag="span"
                  :to="{ name: 'unbound', params: { id: props.item.id } }"
                >
                  unbound</v-btn
                >
                -->

                <v-btn
                  flat
                  small
                  outline
                  color="indigo"
                  tag="span"
                  :to="{ name: 'update-bucket', params: { id: props.item.id } }"
                >
                  add more</v-btn
                >
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
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";

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
  loading = true;
  running = false;

  get ownedBuckets() {
    return this.buckets
      .filter((b) => b.owner in this.walletMap)
      .map((b) => {
        b.owned = true;
        b.candidateName = this.candidateNameMap[b.candidate] || "-";
        b.matureFromNow = b.unbounded
          ? moment.utc(1000 * Number(b.matureTime)).fromNow()
          : "";
        b.state = b.unbounded ? "unbounded" : "created";
        b.type = b.autobid >= 100 ? "autobid" : "userbid";
        return b;
      });
  }

  get votedBuckets() {
    return this.buckets
      .filter((b) => b.candidate in this.walletMap)
      .map((b) => {
        b.owned = false;
        b.candidateName = this.candidateNameMap[b.candidate] || "-";
        b.matureFromNow = b.unbounded
          ? moment.utc(1000 * Number(b.matureTime)).fromNow()
          : "";
        b.state = b.unbounded ? "unbounded" : "valid";
        b.type = b.autobid >= 100 ? "autobid" : "userbid";
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

  rowsPerPage = [50, 100, 200, { text: "All", value: -1 }];

  headers = [
    { text: "Bucket ID", value: "id", sortable: true },
    { text: "Owner Address", value: "owner", sortable: true },
    { text: "Candidate Address", value: "candidate", sortable: true },
    { text: "Name", value: "candidateName", sortable: true },
    { text: "Total Votes", value: "totalVotes", sortable: true },
    { text: "Type", value: "type", sortable: false },
    { text: "State", value: "state", sortable: true },
    { text: "Action", value: "action", sortable: true },
  ];

  async refresh() {
    console.log("refresh bucket list");
    this.loading = true;
    const buckets = await flex.meter.buckets();
    this.$store.commit("updateBuckets", buckets);

    console.log("refresh candidate list");
    const candidates = await flex.meter.candidates();
    this.$store.commit("updateCandidates", candidates);
    this.loading = false;
    if (this.running) {
      setTimeout(this.refresh, 5000);
    }
  }

  async created() {
    this.running = true;
    await this.refresh();
  }

  destroyed() {
    this.running = false;
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