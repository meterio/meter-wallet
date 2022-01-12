<template>
  <v-layout column align-center class="pa-5">
    <v-card flat tile style="width: 600px" class="mt-5 pa-2 outline">
      <v-card-title class="card-title">Unbound Bucket</v-card-title>
      <v-card-text class="pt-1">
        <v-alert color="info" icon="info" outline :value="true"
          >This action will mark this bucket as unbounded, and you could only
          withdraw funds after a lock down period of 7 days (known as mature
          time)</v-alert
        >

        <div class="section">
          <label>Bucket ID</label>
          <div>{{ bucket.id }}</div>
        </div>

        <div class="section">
          <label>Bucket Owner</label>
          <WalletChoice :wallet="wallet" :compact="true"></WalletChoice>
        </div>

        <div class="section">
          <label> Bucket Amount </label>
          <div class="content">
            <Amount sym="STPD">{{ bucket.value }}</Amount>
          </div>
        </div>
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
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import BigNumber from "bignumber.js";
import { ScriptEngine } from "@meterio/devkit";
import WalletChoice from "../components/WalletChoice.vue";

@Component({ components: { WalletChoice } })
export default class StakingUnbound extends Vue {
  @State
  wallets!: entities.Wallet[];

  errMsg = "";

  bucket: Flex.Meter.Bucket = {} as any;
  wallet: entities.Wallet = {} as any;

  async created() {
    const id = this.$route.params.id;
    const bucket = await flex.meter.bucket(id).get();

    if (!bucket) {
      this.errMsg = `Could not find bucket ${id}`;
      return;
    }
    this.bucket = bucket;

    if (!bucket.owner) {
      this.errMsg = `Bucket owner ${bucket.owner} does not exist`;
      return;
    }
    const address = bucket.owner.toLowerCase();
    let index = -1;
    index = this.wallets.findIndex(
      (wallet) => wallet.address.toLowerCase() === address
    );
    this.wallet = this.wallets[index];
    if (index < 0) {
      this.errMsg = `You don't own wallet ${bucket.owner.toLowerCase()}`;
      return;
    }
    this.wallet = this.wallets[index];
  }

  async send() {
    this.errMsg = "";
    try {
      const value = new BigNumber(this.bucket.value).toFixed();
      let holderAddr = this.wallet.address;
      const dataBuffer = ScriptEngine.getUnboundData(
        holderAddr,
        this.bucket.id,
        value
      );
      await flex.vendor
        .sign("tx")
        .signer(this.wallet.address!)
        .request([
          {
            to: holderAddr,
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
