<template>
  <v-layout column pa-5>
    <h3 class="pa-3">Staking Candidates</h3>
    <v-card>
      <v-card-title>
        <router-link :to="{ name: 'candidate' }">
          <v-btn depressed small color="primary">List me as candidate</v-btn>
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
        ></v-text-field>
      </v-card-title>
      <div v-if="candidates.length > 0">
        <v-data-table
          :headers="headers"
          :items="candidateList"
          :search="search"
          :rows-per-page-items="rowsPerPage"
        >
          <template slot="items" slot-scope="props">
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.address }}</td>
            <td>{{ props.item.ipAddr }}</td>
            <td>{{ props.item.commission }}</td>
            <td>
              <Amount sym="MTRG">{{ props.item.totalVotes }}</Amount>
            </td>
            <td>
              <div v-for="id in props.item.buckets" :key="id">
                <router-link :to="{ name: 'bucket', params: { id: id } }">{{
                  id | shortID
                }}</router-link>
              </div>
            </td>
            <td>
              <router-link
                tag="span"
                :to="{
                  name: 'vote',
                  params: { candidateAddress: props.item.address },
                }"
              >
                <v-btn flat small outline color="teal">Vote</v-btn>
                <router-link
                  v-if="props.item.owned"
                  tag="span"
                  :to="{ name: 'uncandidate', params: {} }"
                >
                  <v-btn flat small outline color="grey">Uncandidate</v-btn>
                </router-link>
                <router-link
                  v-if="props.item.owned"
                  tag="span"
                  :to="{ name: 'update-candidate', params: {} }"
                >
                  <v-btn flat small outline color="blue">Update</v-btn>
                </router-link>
              </router-link>
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
import { Address, Bucket } from "@/common/formatter";
import env from "@/env";

@Component
export default class CandidateList extends Vue {
  @State
  candidates!: entities.Candidate[];

  @State
  wallets!: entities.Wallet[];

  timer: NodeJS.Timeout = {} as any;

  get candidateList() {
    return this.candidates.map((c) => {
      if (c.address in this.walletMap) {
        c.owned = true;
      }
      return c;
    });
  }

  get walletMap() {
    const walletMap = this.wallets.reduce((map: Record<string, boolean>, w) => {
      map[w.address] = true;
      return map;
    }, {});
    return walletMap;
  }

  data() {
    return { search: "" };
  }
  logoUrl = env.logoUrl;
  rowsPerPage = [20, 40, 100, { text: "All", value: -1 }];

  headers = [
    { text: "Name", value: "name" },
    { text: "Wallet Address", value: "address" },
    { text: "IP", value: "ipAddr" },
    { text: "Commission", value: "commission" },
    { text: "Total Votes", value: "totalVotes" },
    { text: "Buckets", value: "buckets" },
    { text: "Action", value: "action" },
  ];

  async refresh() {
    console.log("refresh candidates");
    const candidates = await flex.meter.candidates();
    this.$store.commit("updateCandidates", candidates);
  }

  async created() {
    await this.refresh();
    this.startInterval();
  }

  destroyed() {
    this.stopInterval();
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