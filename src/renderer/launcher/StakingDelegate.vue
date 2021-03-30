<template>
  <v-layout column align-center pa-5>
    <v-card flat tile style="width: 600px" class="mt-5 pa-2 outline">
      <v-card-title class="card-title">Delegate bucket</v-card-title>

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
          <label>Bucket Amount</label>
          <div>
            <Amount sym="MTRG">{{ bucket.value }}</Amount>
          </div>
        </div>

        <div class="section">
          <label>Current Candidate</label>
          <div>{{ bucket.candidate }}</div>
        </div>

        <v-form ref="form">
          <v-select
            :items="candidatesList"
            small
            v-model="candAddr"
            label="New Candidate"
            item-text="text"
            item-value="value"
            :autofocus="true"
          ></v-select>
          <v-checkbox label="Enable auto-bid" v-model="autobid"> </v-checkbox>
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
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import BigNumber from "bignumber.js";
import { cry, ScriptEngine } from "@meterio/devkit";
import WalletChoice from "../components/WalletChoice.vue";

@Component({ components: { WalletChoice } })
export default class StakingDelegate extends Vue {
  @State
  wallets!: entities.Wallet[];

  @State
  candidates!: entities.Candidate[];

  bucket: Flex.Meter.Bucket = {} as any;
  wallet: entities.Wallet = {} as any;

  from = 0;
  errMsg = "";
  token = "MTRG";
  autobid = true;

  optionVal = 1;
  candAddr = "";
  holderAddr = "";

  get candidatesList() {
    return this.candidates
      .map((c) => {
        return {
          text:
            c.name +
            "   (" +
            c.address.substr(0, 8) +
            "..." +
            c.address.substr(c.address.length - 6) +
            ")",
          value: c.address,
        };
      })
      .sort((a, b) => {
        return Math.random() > 0.5 ? 1 : -1;
      });
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
      return;
    }
    try {
      const value = new BigNumber(this.bucket.value).toFixed();
      let holderAddr = this.wallet.address;
      const dataBuffer = ScriptEngine.getDelegateData(
        holderAddr,
        this.candAddr,
        this.bucket.id,
        value,
        undefined,
        undefined,
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
