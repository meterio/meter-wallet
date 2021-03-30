<template>
  <v-layout column align-center class="pa-5">
    <v-card flat tile style="width: 600px" class="mt-5 pa-2 outline">
      <v-card-title class="card-title">Update Bucket</v-card-title>
      <v-card-text>
        <div class="section">
          <label>Bucket ID</label>
          <div>{{ bucket.id }}</div>
        </div>

        <div class="section">
          <label>Bucket Owner</label>
          <WalletChoice :wallet="wallet" :compact="true"></WalletChoice>
        </div>

        <div class="section">
          <label>Current Amount</label>
          <div>
            <Amount sym="MTRG">{{ bucket.value }}</Amount>
          </div>
        </div>

        <v-form ref="form">
          <v-text-field
            validate-on-blur
            type="number"
            label="Extra Amount"
            v-bind:suffix="token"
            :rules="amountRules"
            v-model="amount"
            :append-outer-icon="marker ? 'mdi-infinity' : 'mdi-window-close'"
            @click:append-outer="maxAmount"
          >
          </v-text-field>
        </v-form>
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
import { Component, Mixins } from "vue-property-decorator";
import { State } from "vuex-class";
import BigNumber from "bignumber.js";
import { ScriptEngine } from "@meterio/devkit";
import WalletChoice from "../components/WalletChoice.vue";
import AccountLoader from "../mixins/account-loader";

@Component({ components: { WalletChoice } })
export default class StakingBucketUpdate extends Mixins(AccountLoader) {
  @State
  wallets!: entities.Wallet[];
  amount = "0";
  errMsg = "";
  token = "MTRG";
  marker = true;

  wallet: entities.Wallet = {} as any;
  bucket: Flex.Meter.Bucket = {} as any;

  readonly amountRules = [
    (v: string) => new BigNumber(v).gt(0) || "Invalid amount",
  ];

  maxAmount() {
    if (this.marker) {
      this.amount = this.account
        ? new BigNumber(this.account.balance).dividedBy(1e18).toFixed()
        : "0";
    } else {
      this.amount = "0";
    }
    this.marker = !this.marker;
  }

  get address() {
    return this.wallet.address!;
  }

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
    if (!(this.$refs.form as any).validate()) {
      console.log("ERROR !");
      return;
    }
    try {
      const fromAddr = this.wallet.address;
      let dataBuffer = ScriptEngine.getBucketUpdateData(
        fromAddr,
        this.bucket.id,
        new BigNumber(this.amount).times(1e18).toFixed()
      );
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
