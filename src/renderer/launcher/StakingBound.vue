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
          >Bound locked bucket to candidate</v-card-title
        >
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              validate-on-blur
              type="string"
              label="Candidate Address"
              v-model="candAddr"
            />

            <v-select
              :items="options"
              label="Option"
              v-model="optionVal"
            ></v-select>
            <v-checkbox label="Enable auto-bid" v-model="autobid"> </v-checkbox>
            <v-select :items="items" label="Token" v-model="token"></v-select>
            <v-text-field
              validate-on-blur
              type="number"
              label="Amount"
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
export default class StakingBound extends Vue {
  @State
  wallets!: entities.Wallet[];
  amount = "";
  from = 0;
  errMsg = "";
  token = "MTRG";
  items = [
    { text: "Meter Governance Token (MTRG)", value: "MTRG" },
    { text: "Meter Token", value: "MTR" },
  ];
  optionVal = 1;
  options = [
    { text: "Lock for one week", value: 1 },
    { text: "Lock for two weeks", value: 2 },
    { text: "Lock for three weekds", value: 3 },
    { text: "Lock for four weeks", value: 4 },
  ];
  candAddr = "";
  autobid = false;

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
    let holderAddr = this.$route.query["from"];
    if (holderAddr) {
      holderAddr = holderAddr.toLowerCase();
      const index = this.wallets.findIndex(
        (wallet) => wallet.address === holderAddr
      );
      if (index >= 0) {
        this.from = index;
      }
      this.candAddr = holderAddr;
    }
  }

  async send() {
    this.errMsg = "";
    if (!(this.$refs.form as any).validate()) {
      return;
    }
    try {
      const value = new BigNumber("1" + "0".repeat(18))
        .times(this.amount!)
        .integerValue()
        .toString(10);
      let holderAddr = this.wallets[this.from].address!;
      const dataBuffer = ScriptEngine.getBoundData(
        this.optionVal,
        holderAddr,
        this.candAddr,
        value,
        this.autobid ? 100 : 0
      );
      await flex.vendor
        .sign("tx")
        .signer(holderAddr)
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
