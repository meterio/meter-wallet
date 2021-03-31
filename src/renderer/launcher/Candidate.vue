<template>
  <v-layout column align-center pa-5>
    <v-card flat tile style="width: 600px" class="mt-5 pa-2 outline">
      <v-card-title class="card-title">Candidate Information</v-card-title>
      <v-card-text>
        <div class="section">
          <label>Name</label>
          <div>{{ candidate.name }}</div>
        </div>

        <div class="section">
          <label>Description</label>
          <div :style="{ wordBreak: 'break-all' }">
            {{ candidate.description }}
          </div>
        </div>

        <div class="section">
          <label>Candidate Address</label>
          <WalletChoice v-if="addrInWallets" :wallet="wallet" />
          <div v-else>{{ candidate.address }}</div>
        </div>

        <div class="section">
          <label>IP</label>
          <div>{{ candidate.ipAddr }}</div>
        </div>

        <div class="section">
          <label>Total Votes</label>
          <div>
            <Amount sym="MTRG">{{ candidate.totalVotes }}</Amount>
          </div>
        </div>

        <div class="section">
          <label>Public Key</label>
          <div :style="{ wordBreak: 'break-all' }">{{ candidate.pubKey }}</div>
        </div>

        <div class="section">
          <label>Buckets</label>
          <div v-for="(bucket, i) in candidate.buckets" :key="i">
            <span>#{{ i + 1 }}</span>
            <router-link :to="{ name: 'bucket', params: { id: bucket } }">{{
              bucket
            }}</router-link>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="error--text">{{ errMsg }}</div>
        <v-spacer />
        <div v-if="addrInWallets">
          <v-btn
            depressed
            small
            outline
            color="grey"
            :to="{
              name: 'uncandidate',
              params: { addr: candidate.address },
            }"
          >
            Uncandidate</v-btn
          >
          <v-btn
            depressed
            small
            outline
            color="indigo"
            :to="{
              name: 'update-candidate',
              params: { addr: candidate.address },
            }"
          >
            Update Info</v-btn
          >
        </div>
        <v-btn
          class="ml-2"
          depressed
          small
          outline
          color="success"
          :to="{
            name: 'vote',
            params: { addr: candidate.addr },
          }"
        >
          Vote</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import WalletChoice from "../components/WalletChoice.vue";

@Component({ components: { WalletChoice } })
export default class Candidate extends Vue {
  @State
  candidates!: entities.Candidate[];

  @State
  wallets!: entities.Wallet[];

  candidate = {} as entities.Candidate;
  errMsg = "";

  get wallet() {
    if (!this.addrInWallets) {
      return {} as entities.Wallet;
    }
    for (const w of this.wallets) {
      if (w.address.toLowerCase() === this.candidate.address.toLowerCase()) {
        return w;
      }
    }
    return {} as entities.Wallet;
  }

  get addrInWallets() {
    if (!this.candidate || !this.candidate.address) {
      return false;
    }
    for (const w of this.wallets) {
      if (w.address.toLowerCase() === this.candidate.address.toLowerCase()) {
        return true;
      }
    }
  }

  created() {
    const addr = this.$route.params.addr;

    let candidate = undefined;
    for (const c of this.candidates) {
      if (c.address.toLowerCase() == addr) {
        candidate = c;
        break;
      }
    }
    if (!candidate) {
      this.errMsg = `Could not find candidate ${addr}`;
      return;
    }
    this.candidate = candidate;
  }
}
</script>
