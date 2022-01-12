<template>
  <v-layout column align-center>
    <v-layout column align-center pa-5>
      <div class="subheading py-5"></div>
      <WalletSeeker
        style="width: 270px"
        full-size
        :wallets="wallets"
        v-model="from"
      />
      <v-card flat tile style="width: 600px" class="mt-5 pa-2 outline">
        <v-card-title class="card-title">Bail out</v-card-title>
        <v-card-text>
          <div v-if="walletInJailed">
            <div class="section">
              <label>Name</label>
              <div>{{ jailed.name }}</div>
            </div>
            <div class="section">
              <label>Public Key</label>
              <div style="word-break: break-all">{{ jailed.pubKey }}</div>
            </div>
            <div class="section">
              <label>Total Points</label>
              <div>{{ jailed.totalPoints }}</div>
            </div>
            <div class="section">
              <label>Bail Amount</label>
              <div>
                <Amount sym="STPD">{{ jailed.bailAmount }}</Amount>
              </div>
            </div>
            <div class="section">
              <label>Jailed Time</label>
              <div>
                {{ jailed.jailedTime | fromNow }} ({{
                  jailed.jailedTime | dateTime
                }})
              </div>
            </div>
          </div>
          <div v-else>
            <v-alert color="info" icon="info" outline :value="true"
              >No jailed information found associated with this wallet</v-alert
            >
          </div>
          <v-form ref="form"></v-form>
        </v-card-text>
        <v-card-actions>
          <div class="error--text">{{ errMsg }}</div>
          <v-spacer />
          <v-btn flat class="primary" @click="send" v-if="walletInJailed"
            >Send</v-btn
          >
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
export default class SlashingBailOut extends Vue {
  @State
  wallets!: entities.Wallet[];

  jaileds: entities.Jailed[] = [];
  jailed: entities.Jailed = {} as any;
  from = 0;
  errMsg = "";
  token = "STPD";

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

  get walletInJailed() {
    let addr = this.wallets[this.from].address.toLowerCase();
    for (const j of this.jaileds) {
      if (j.address.toLowerCase() === addr) {
        return true;
      }
    }
    return false;
  }

  @Watch("from")
  fromChanged() {
    let addr = this.wallets[this.from].address.toLowerCase();
    for (const j of this.jaileds) {
      if (j.address.toLowerCase() === addr) {
        this.jailed = j;
        return;
      }
    }
    this.jailed = {} as any;
  }

  async created() {
    const jaileds = await flex.meter.jaileds();
    this.jaileds = jaileds;
    this.$store.commit("updateJaileds", jaileds);

    let fromAddr = this.$route.params.addr;
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
      let dataBuffer = ScriptEngine.getBailOutData(fromAddr);
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
