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
      <v-card tile style="width: 500px" class="mt-4 py-2 px-2 outline">
        <v-card-title class="subheading">uncandidate this account</v-card-title>
        <v-card-text>
          <v-form ref="form"></v-form>
        </v-card-text>
        <v-card-actions>
          <div class="error--text">{{ errMsg }}</div>
          <v-spacer />
          <v-btn class="primary" @click="send">Send</v-btn>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { State } from "vuex-class";
import BigNumber from "bignumber.js";
import { cry, ScriptEngine } from "@meterio/devkit";

@Component
export default class StakingUncandidate extends Vue {
  @State
  wallets!: entities.Wallet[];
  stakingID = "";
  from = 0;
  addr = "";
  errMsg = "";

  @Watch("from")
  onFromChange(oldVal: string, newVal: string) {
    this.addr = this.wallets[this.from].address;
  }
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

  created() {
    let fromAddr = this.$route.query["from"];
    if (fromAddr) {
      fromAddr = fromAddr.toLowerCase();
      const index = this.wallets.findIndex(
        (wallet) => wallet.address === fromAddr
      );
      if (index >= 0) {
        this.from = index;
        this.addr = fromAddr;
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
      const dataBuffer = ScriptEngine.getUncandidateData(fromAddr);
      await flex.vendor
        .sign("tx")
        .signer(this.wallets[this.from].address!)
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
