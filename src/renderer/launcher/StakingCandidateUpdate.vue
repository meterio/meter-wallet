<template>
  <v-layout column align-center pa-5>
    <v-card flat tile style="width: 600px" class="mt-5 pa-2 outline">
      <v-card-title class="card-title">Update candidate </v-card-title>
      <v-card-text>
        <div class="section">
          <label>Candidate Address</label>
          <WalletChoice :wallet="wallet" />
        </div>
        <v-form ref="form">
          <v-text-field
            ref="name"
            label="Name"
            :rules="nameRules"
            validate-on-blur
            v-model="name"
          ></v-text-field>

          <v-textarea
            ref="description"
            label="Description"
            :rules="descRules"
            validate-on-blur
            v-model="description"
            rows="3"
          ></v-textarea>

          <v-text-field
            ref="ip"
            label="IP"
            :rules="ipRules"
            validate-on-blur
            v-model="ip"
          ></v-text-field>
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
          <v-checkbox label="Enable auto-bid" v-model="autobid"> </v-checkbox>

          <v-textarea
            ref="pubkey"
            label="Public Key"
            :rules="pubkeyRules"
            validate-on-blur
            v-model="pubkey"
            rows="4"
          ></v-textarea>
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
import { Vue, Component, Mixins } from "vue-property-decorator";
import { State } from "vuex-class";
import { cry, ScriptEngine } from "@meterio/devkit";
import AccountLoader from "../mixins/account-loader";
import WalletChoice from "../components/WalletChoice.vue";

@Component({ components: { WalletChoice } })
export default class StakingCandidateUpdate extends Mixins(AccountLoader) {
  @State
  wallets!: entities.Wallet[];

  @State
  candidates!: entities.Candidate[];

  errMsg = "";

  name = "";
  description = "";
  pubkey = "";
  ip = "";
  port = "8670";
  commission = 10.0;
  autobid = true;

  candidate: entities.Candidate = {} as any;
  wallet: entities.Wallet = {} as any;

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

  readonly nameRules = [(v: string) => !!v || "Input name here"];
  readonly descRules = [(v: string) => !!v || "Input description here"];
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
    },
  ];
  readonly ipRules = [
    (v: string) => !!v || "Input ip here",
    (v: string) => !!v.match(/\d+[.]\d+[.]\d+[.]\d+/) || "Invalid IPv4 Address",
  ];
  readonly portRules = [
    (v: string) =>
      (0 < parseInt(v) && parseInt(v) <= 65535) ||
      "Invalid port number (1-65535)",
  ];

  readonly commissionRules = [
    (v: number) =>
      (100 <= v * 100 && v * 100 <= 10000) ||
      "Invalid commission rate, must be in range [1,100] %",
  ];

  created() {
    const addr = this.$route.params.addr;
    console.log("CANDIATE ADDRESS: ", addr);
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
    this.name = candidate.name;
    this.description = candidate.description;
    this.ip = candidate.ipAddr;
    this.commission = candidate.commission;
    this.pubkey = candidate.pubKey;

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
    if (!(this.$refs.form as any).validate()) {
      return;
    }
    try {
      let fromAddr = this.wallet.address!;
      let dataBuffer = ScriptEngine.getCandidateUpdateData(
        fromAddr,
        this.name,
        this.description,
        this.pubkey,
        this.ip,
        parseInt(this.port),
        Math.floor(this.commission * 100),
        undefined,
        undefined,
        this.autobid ? 100 : 0
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
