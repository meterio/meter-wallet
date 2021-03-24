<template>
  <v-layout column align-center>
    <v-layout column align-center style="max-width: 1000px; width: 100%" pa-3>
      <div class="subheading py-4"></div>
      <WalletSeeker
        style="width: 270px"
        full-size
        :wallets="wallets"
        v-model="from"
      />
      <v-card flat tile style="width: 500px" class="mt-4 py-2 px-2 outline">
        <v-card-title class="subheading"
          >Update staking candidate information</v-card-title
        >
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              ref="bucketID"
              disabled
              label="Bucket ID"
              v-model="bucketID"
            />
            <v-text-field
              ref="curAmount"
              disabled
              v-bind:suffix="token"
              label="Current Amount"
              v-model="curAmount"
            />
            <v-text-field
              validate-on-blur
              type="number"
              label="Add Amount"
              v-bind:suffix="token"
              :rules="amountRules"
              v-model="amount"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <div class="error--text">{{ errMsg }}</div>
          <v-spacer />
          <v-btn flat class="primary" @click="send">Send</v-btn>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import BigNumber from "bignumber.js";
import { cry, ScriptEngine } from "@meterio/devkit";

@Component
export default class StakingBucketUpdate extends Vue {
  @State
  wallets!: entities.Wallet[];
  from = 0;
  amount = "";
  errMsg = "";
  curAmount = "0";
  token = "MTRG";
  bucketID = "";

  readonly addressRules = [
    (v: string) => !!v || "Input address here",
    (v: string) => {
      if (!cry.isAddress(v)) {
        return "Invalid address";
      }
      if (v !== v.toLowerCase() && cry.toChecksumAddress(v) !== v) {
        return "Checksum incorrect";
      }
      return true;
    },
  ];
  readonly amountRules = [
    (v: string) => new BigNumber(0).lte(v) || "Invalid amount",
  ];

  created() {
    let fromAddr = this.$route.params.addr;
    let bucketID = this.$route.params.bucketid;
    let curAmount = new BigNumber(this.$route.params.amount)
      .dividedBy(1e18)
      .toFixed();
    this.curAmount = curAmount;
    this.bucketID = bucketID;
    if (fromAddr) {
      fromAddr = fromAddr.toLowerCase();
      const index = this.wallets.findIndex(
        (wallet) => wallet.address === fromAddr
      );
      if (index >= 0) {
        this.from = index;
      }
    }
  }

  async send() {
    this.errMsg = "";
    if (!(this.$refs.form as any).validate()) {
      return;
    }
    try {
      let fromAddr = this.wallets[this.from].address!;
      let dataBuffer = ScriptEngine.getBucketUpdateData(
        fromAddr,
        this.bucketID,
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
