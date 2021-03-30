<template>
  <v-layout column align-center pa-5>
    <v-card flat tile style="width: 600px" class="mt-5 pa-2 outline">
      <v-card-title class="card-title">Bucket Information</v-card-title>
      <v-card-text>
        <div class="section">
          <label>ID</label>
          <div>{{ bucket.id }}</div>
        </div>

        <div class="section">
          <label>Bucket Owner</label>

          <WalletChoice v-if="ownerInWallets" :wallet="wallet" />
          <div v-else>{{ bucket.owner }}</div>
        </div>

        <div class="section">
          <label>Candidate</label>
          <div>{{ bucket.candidate }}</div>
        </div>

        <div class="section">
          <label>Votes</label>
          <div>
            <Amount sym="MTRG">{{ bucket.votes }}</Amount>
          </div>
        </div>

        <div class="section">
          <label>Bonus Votes</label>
          <div>
            <Amount sym="MTRG">{{ bucket.bonus }}</Amount>
          </div>
        </div>

        <div class="section">
          <label>Type</label>
          <div>{{ bucket.autobid >= 100 ? "autobid" : "userbid" }}</div>
        </div>

        <div class="section">
          <label>Status</label>
          <div>
            {{ bucket.unbounded ? "Unbounded " + matureFromNow : "Valid" }}
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="error--text">{{ errMsg }}</div>
        <v-spacer />
        <div v-if="ownerInWallets">
          <v-btn
            depressed
            small
            color="grey"
            outline
            :to="{
              name: 'unbound',
              params: { id: bucket.id },
            }"
          >
            Unbound</v-btn
          >

          <v-btn
            v-if="isZeroCandidate"
            depressed
            small
            outline
            color="teal"
            :to="{
              name: 'delegate',
              params: { id: bucket.id },
            }"
          >
            Delegate</v-btn
          >

          <v-btn
            v-else
            depressed
            small
            outline
            color="primary"
            :to="{
              name: 'undelegate',
              params: { id: bucket.id },
            }"
          >
            Undelegate</v-btn
          >
          <v-btn
            depressed
            small
            outline
            color="indigo"
            :to="{
              name: 'update-bucket',
              params: { id: bucket.id },
            }"
          >
            Add more</v-btn
          >
        </div>
      </v-card-actions>
    </v-card>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
const moment = require("moment");
import WalletChoice from "../components/WalletChoice.vue";

@Component({ components: { WalletChoice } })
export default class Bucket extends Vue {
  @State
  wallets!: entities.Wallet[];

  id = "";
  bucket = {} as entities.Bucket;

  get wallet() {
    if (!this.ownerInWallets) {
      return {} as entities.Wallet;
    }
    for (const w of this.wallets) {
      if (w.address.toLowerCase() === this.bucket.owner.toLowerCase()) {
        return w;
      }
    }
    return {} as entities.Wallet;
  }

  get ownerInWallets() {
    if (!this.bucket || !this.bucket.owner) {
      return false;
    }
    for (const w of this.wallets) {
      if (w.address.toLowerCase() === this.bucket.owner.toLowerCase()) {
        return true;
      }
    }
  }

  get matureFromNow() {
    return this.bucket.unbounded
      ? moment.utc(1000 * Number(this.bucket.matureTime)).fromNow()
      : "";
  }

  get isZeroCandidate() {
    return (
      this.bucket.candidate === "0x0000000000000000000000000000000000000000"
    );
  }

  async created() {
    const id = this.$route.params.id;
    this.id = id;
    this.bucket = await flex.meter.bucket(id).get();
  }
}
</script>
