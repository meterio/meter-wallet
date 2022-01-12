<template>
  <v-layout column align-center pa-5>
    <v-card flat tile style="width: 600px" class="mt-5 pa-2 outline">
      <v-card-title class="card-title">Uncandidate</v-card-title>
      <v-card-text class="pt-1">
        <v-alert color="warning" icon="warning" outline :value="true"
          >This action will remove this node from candidate list, and all
          related buckets will be undelegated. You could only withdraw your fund
          after a lockd down period of 7-days.</v-alert
        >
        <div class="section">
          <label>Name</label>
          <div>{{ candidate.name }}</div>
        </div>

        <div class="section">
          <label>Candidate Address</label>
          <WalletChoice :wallet="wallet" />
        </div>

        <div class="section">
          <label>Description</label>
          <div>{{ candidate.description }}</div>
        </div>

        <div class="section">
          <label>Candidate IP</label>
          <div>{{ candidate.ipAddr }}</div>
        </div>

        <div class="section">
          <label>Total Votes</label>
          <div>
            <Amount sym="STPD">{{ candidate.totalVotes }}</Amount>
          </div>
        </div>

        <v-form ref="form"></v-form>
      </v-card-text>
      <v-card-actions>
        <div class="error--text">{{ errMsg }}</div>
        <v-spacer />
        <v-btn flat class="primary" @click="send">Send</v-btn>
      </v-card-actions>
    </v-card>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { State } from "vuex-class";
import { ScriptEngine } from "@meterio/devkit";
import WalletChoice from "../components/WalletChoice.vue";

@Component({ components: { WalletChoice } })
export default class StakingUncandidate extends Vue {
  @State
  wallets!: entities.Wallet[];
  @State
  candidates!: entities.Candidate[];

  addr = "";
  errMsg = "";

  wallet: entities.Wallet = {} as any;
  candidate: entities.Candidate = {} as any;

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

    let index = -1;
    index = this.wallets.findIndex(
      (wallet) => wallet.address.toLowerCase() === addr
    );
    this.wallet = this.wallets[index];
    if (index < 0) {
      this.errMsg = `You don't own wallet ${addr.toLowerCase()}`;
      return;
    }
    this.wallet = this.wallets[index];
  }

  async send() {
    this.errMsg = "";
    try {
      let fromAddr = this.wallet.address!;
      const dataBuffer = ScriptEngine.getUncandidateData(fromAddr);
      await flex.vendor
        .sign("tx")
        .signer(fromAddr)
        .request([
          {
            to: fromAddr,
            value: "0",
            token: ScriptEngine.Token.MeterGov,
            data: "0x" + dataBuffer.toString("hex"),
          },
        ]);
      this.$router.back();
    } catch (err) {
      this.errMsg = `${err.name}: ${err.message}`;
    }
  }
}
</script>

<style scoped>
.unset-cursor >>> * {
  cursor: unset;
}
</style>
