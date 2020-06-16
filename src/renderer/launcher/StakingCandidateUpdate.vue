<template>
  <v-layout column align-center>
    <v-layout column align-center style="max-width:1000px;width:100%;" pa-3>
      <div class="subheading py-4"></div>
      <WalletSeeker style="width:270px" full-size :wallets="wallets" v-model="from" />
      <v-card flat tile style="width:500px;" class="mt-4 py-2 px-2 outline">
        <v-card-title class="subheading">Update staking candidate information</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              ref="name"
              label="Name"
              :rules="nameRules"
              validate-on-blur
              v-model="name"
            ></v-text-field>

            <v-text-field ref="ip" label="IP" :rules="ipRules" validate-on-blur v-model="ip"></v-text-field>
            <v-text-field
              ref="port"
              type="number"
              :rules="portRules"
              validate-on-blur
              label="Port"
              v-model="port"
              disabled
            ></v-text-field>

            <v-text-field
              type="number"
              validate-on-blur
              label="Commission Rate"
              :rules="commissionRules"
              v-model="commission"
              suffix="%"
            ></v-text-field>

            <v-textarea
              ref="pubkey"
              label="Public Key"
              :rules="pubkeyRules"
              validate-on-blur
              v-model="pubkey"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <div class="error--text">{{errMsg}}</div>
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
import { Script } from "vm";

@Component
export default class StakingCandidateUpdate extends Vue {
  @State
  wallets!: entities.Wallet[];
  name = "";
  pubkey = "";
  ip = "";
  port = "8670";
  from = 0;
  errMsg = "";
  token = "MTRG";
  commission = 10.0;

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
    }
  ];

  readonly nameRules = [(v: string) => !!v || "Input name here"];
  readonly pubkeyRules = [
    (v: string) => !!v || "Input public key here",
    (v: string) => {
      let keys = v.split(":::");
      if (keys.length != 2) {
        return "Incomplete key";
      }
      const ecdsaPK = keys[0];
      const blsPK = keys[1];
      const ecdsaPKHex = Buffer.from(ecdsaPK, "base64").toString("hex");
      let formattedEcdsaPK = Buffer.from(ecdsaPK, "base64").toString("base64");
      if (formattedEcdsaPK != ecdsaPK.trim())
        return "Invalid public key, unncessary suffix characters";
      return ecdsaPKHex.length == 130 || "Invalid public key";
    }
  ];
  readonly ipRules = [
    (v: string) => !!v || "Input ip here",
    (v: string) => !!v.match(/\d+[.]\d+[.]\d+[.]\d+/) || "Invalid IPv4 Address"
  ];
  readonly portRules = [
    (v: string) =>
      (0 < parseInt(v) && parseInt(v) <= 65535) ||
      "Invalid port number (1-65535)"
  ];

  readonly commissionRules = [
    (v: number) =>
      (100 <= v * 100 && v * 100 <= 10000) ||
      "Invalid commission rate, must be in range [1,100] %"
  ];

  created() {
    let fromAddr = this.$route.params.addr;
    if (fromAddr) {
      fromAddr = fromAddr.toLowerCase();
      const index = this.wallets.findIndex(
        wallet => wallet.address === fromAddr
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
      let dataBuffer = ScriptEngine.getCandidateUpdateData(
        fromAddr,
        this.name,
        this.pubkey,
        this.ip,
        parseInt(this.port),
        Math.floor(this.commission * 100)
      );
      await flex.vendor
        .sign("tx")
        .signer(fromAddr)
        .request([
          {
            to: fromAddr,
            value: "0",
            token: ScriptEngine.Token.MeterGov,
            data: "0x" + dataBuffer.toString("hex")
          }
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
