<template>
  <v-layout column align-center>
    <v-layout column align-center pa-5>
      <div class="subheading mt-5 pa-2"></div>
      <WalletSeeker
        style="width: 270px"
        full-size
        :wallets="wallets"
        v-model="from"
      />
      <v-card flat tile style="width: 600px" class="mt-4 pa-2 outline">
        <v-card-title class="card-title">Auction Bid</v-card-title>
        <v-card-text>
          <div class="section">
            <label>Auction ID</label>
            <div>{{ presentAuction.auctionID }}</div>
          </div>
          <div class="section">
            <label>MTRG on Auction</label>
            <div>
              <Amount sym="MTRG">{{ presentAuction.releasedMTRG }}</Amount>
            </div>
          </div>
          <div class="section">
            <label>Received MTR</label>
            <div>
              <Amount sym="MTR">{{ presentAuction.receivedMTR }}</Amount>
            </div>
          </div>
          <div class="section">
            <label>Expected Price</label>
            <div>
              <Amount sym="MTR">{{ expectedPrice }}</Amount>
            </div>
          </div>

          <v-form ref="form">
            <v-text-field
              validate-on-blur
              type="number"
              label="Amount"
              v-bind:suffix="token"
              :rules="amountRules"
              v-model="amount"
              :append-outer-icon="marker ? 'mdi-infinity' : 'mdi-window-close'"
              @click:append-outer="maxAmount"
            />
          </v-form>

          <div class="section">
            <label>Estimated result MTRG with current price</label>
            <div>
              <Amount sym="MTRG">{{ expectedReceive }}</Amount>
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
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Mixins, Watch } from "vue-property-decorator";
import { State } from "vuex-class";
import BigNumber from "bignumber.js";
import { cry, ScriptEngine } from "@meterio/devkit";
import AccountLoader from "../mixins/account-loader";

@Component
export default class StakingBound extends Mixins(AccountLoader) {
  @State
  wallets!: entities.Wallet[];

  @State
  presentAuction!: entities.AuctionCB;

  amount = "0";
  from = 0;
  errMsg = "";
  token = "MTR";

  bidderAddr = "";
  marker = true;

  get address() {
    return this.wallets[this.from].address;
  }

  get expectedPrice() {
    if (!this.presentAuction) {
      return NaN;
    }
    let price = new BigNumber(this.presentAuction.receivedMTR)
      .dividedBy(this.presentAuction.releasedMTRG)
      .times(1e18);
    if (price.isLessThan(this.presentAuction.reservedPrice)) {
      return this.presentAuction.reservedPrice;
    } else {
      return price.toFixed();
    }
  }

  get expectedReceive() {
    if (Number.isNaN(this.expectedPrice)) {
      return NaN;
    }
    return new BigNumber(this.amount)
      .times(1e18)
      .times(1e18)
      .dividedBy(this.expectedPrice)
      .toFixed();
  }

  maxAmount() {
    if (this.marker) {
      if (this.token === "MTR") {
        if (!this.account) {
          this.amount = "0";
          return;
        }
        const energy = new BigNumber(this.account.energy);
        if (energy.isGreaterThan(new BigNumber(0.0105).times(1e18))) {
          this.amount = energy
            .minus(new BigNumber(0.0105).times(1e18))
            .dividedBy(1e18)
            .toFixed();
        } else {
          this.amount = energy.dividedBy(1e18).toFixed();
        }
      }
    } else {
      this.amount = "0";
    }
    this.marker = !this.marker;
  }

  @Watch("from")
  fromChanged() {
    this.marker = true;
    this.amount = "0";
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
  readonly amountRules = [
    (v: string) => new BigNumber(0).lt(v) || "Invalid amount",
  ];

  async created() {
    const present = await flex.meter.auction();
    if (present) {
      this.$store.commit("updatePresentAuction", present);
      this.presentAuction = present;
    } else {
      this.errMsg = "No present auction";
      return;
    }
    let holderAddr = this.$route.query["from"];
    if (holderAddr) {
      holderAddr = holderAddr.toLowerCase();
      const index = this.wallets.findIndex(
        (wallet) => wallet.address === holderAddr
      );
      if (index >= 0) {
        this.from = index;
      }
      this.bidderAddr = holderAddr;
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
        .toFixed();
      let holderAddr = this.wallets[this.from].address!;
      const dataBuffer = ScriptEngine.getBidData(holderAddr, value);
      console.log("DATA: ", dataBuffer.toString("hex"));
      await flex.vendor
        .sign("tx")
        .signer(this.wallets[this.from].address!)
        .request([
          {
            to: holderAddr,
            value: "0",
            token: ScriptEngine.Token.Meter,
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
