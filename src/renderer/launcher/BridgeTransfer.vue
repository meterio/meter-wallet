<template>
  <v-layout column align-center>
    <v-layout column align-center style="max-width:1000px;width:100%;" pa-3>
      <div class="subheading py-4">Transfer from</div>
      <WalletSeeker style="width:270px" full-size :wallets="wallets" v-model="from" />

      <v-card flat tile style="width:700px;" class="mt-4 py-2 px-2 outline">
        <v-card-title class="subheading">
          <v-layout row wrap>
            <v-flex xs12>
              <h3>Bridge Exchange Rules</h3>
            </v-flex>
            <v-flex xs-12 style="marginTop:20px;">
              <ol style="fontSize:90%">
                <li>This bridge functionality is still under beta test. By clicking the “Send” button, you agree that you understand and accept all risks involved, including without limitation any loss of funds, errors or bugs in the relevant smart contract, calculation mistakes, delay of receiving funds etc.</li>
                <li>To avoid abusing the bridge and cover the ETH gas cost. We currently charge a fee of 0.5% transfer amount with a minimum 10 MTRG or 20 MTR (depend on which token is being mapped). This fee is subject to change.</li>
                <li>Please backup your wallet to keystore file and import it to an ETH wallet (such as Metamask) and make sure the imported ETH wallet address is the same as your Meter wallet address. eMTRG and eMTR will be mapped to the same address by the bridge.</li>
                <li>Please allow 5 minutes for the fund to settle. If you do not see the tokens in 5 mins, please save your Meter network transaction hash and contact us in telegram or discord channels (edited)</li>
              </ol>
            </v-flex>
          </v-layout>
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              validate-on-blur
              :rules="addressRules"
              label="Bridge Exchange Address"
              v-model="to"
              disabled
            />
            <v-layout row wrap>
              <v-flex xs12 sm8>
                <v-text-field
                  validate-on-blur
                  type="number"
                  label="Amount"
                  :rules="amountRules"
                  v-model="amount"
                  autofocus
                  v-on:keyup="calcToll"
                />
              </v-flex>
              <v-flex xs12 sm4>
                <v-select
                  :items="tokenItems"
                  label="Token"
                  v-model="token"
                  :hint="`${token.fullname}`"
                  item-text="symbol"
                  item-value="symbol"
                  return-object
                  persistent-hint
                ></v-select>
              </v-flex>
              <v-flex xs12>
                <v-text-field label="Toll fee" v-model="toll" disabled />
              </v-flex>

              <v-flex xs12 v-if="token.symbol=='MTRG'">
                <v-text-field label="Available Capacity" v-model="mtrgAvailableCapacity" disabled />
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <div class="error--text" v-if="errMsg">{{errMsg}}</div>
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
import { cry } from "@meterio/devkit";
import { Wallet } from "@meterio/flex-framework";
import { BridgeAPI } from "../flex-driver/bridge-api";
import { AppBridge } from "../flex-driver/app-bridge";
const BRIDGE_EXCHANGE_ADDR = "0x5c5713656c6819ebe3921936fd28bed2a387cda5";

@Component
export default class BridgeTransfer extends Vue {
  @State
  wallets!: entities.Wallet[];
  amount: number = NaN;
  to = BRIDGE_EXCHANGE_ADDR;
  from = 0;
  errMsg = "";
  toll = 0;
  tokenItems = [
    { symbol: "MTRG", fullname: "Meter Governance Token" },
    { symbol: "MTR", fullname: "Meter Token" },
  ];
  token = { symbol: "MTRG", fullname: "Meter Governance Token" };
  showHistory = false;
  history: {
    addr: string;
    walletName: string | null;
  }[] = [];
  mtrgCapacity = "0";
  mtrgUsed = "0";

  get mtrgAvailableCapacity() {
    return new BigNumber(this.mtrgCapacity)
      .minus(this.mtrgUsed)
      .dividedBy(1e18)
      .toFixed();
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
    (v: number) => new BigNumber(0).lte(v) || "Invalid amount",
  ];

  created() {
    this.getCapacity();
    let fromAddr = this.$route.query["from"];
    console.log("FROM: ", fromAddr);
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

  calcToll() {
    if (!new BigNumber(this.amount).isPositive()) {
      this.toll = 0;
      return;
    }
    this.toll = 0;
    const floatFee = new BigNumber(this.amount).multipliedBy(0.005);
    const flatFee = this.token.symbol === "MTRG" ? 10 : 20;
    if (floatFee.isGreaterThan(flatFee)) {
      this.toll = floatFee.toNumber();
    } else {
      this.toll = flatFee;
    }
  }

  async hasEnoughBalance(
    wallet: entities.Wallet,
    amount: number,
    token: string
  ) {
    const acc = await flex.meter.account(wallet.address).get();
    console.log(acc);
    if (token === "MTRG") {
      console.log(
        "balance: ",
        new BigNumber(acc.balance).dividedBy(1e18).toFixed()
      );
      const res = new BigNumber(acc.balance)
        .dividedBy(1e18)
        .isGreaterThanOrEqualTo(new BigNumber(amount));
      return res;
    } else if (token === "MTR") {
      const res = new BigNumber(acc.energy)
        .dividedBy(1e18)
        .isGreaterThanOrEqualTo(new BigNumber(amount));
      return res;
    }
    return false;
  }

  async reachedCapacity(amount: number, tokenSymbol: string) {
    console.log(amount);
    console.log(this.mtrgUsed);
    console.log(this.mtrgCapacity);
    if (tokenSymbol === "MTRG" && this.mtrgCapacity !== "0") {
      return new BigNumber(amount)
        .multipliedBy(1e18)
        .plus(this.mtrgUsed)
        .isGreaterThan(this.mtrgCapacity);
    }
    return false;
  }

  async getCapacity() {
    try {
      const c = await window.bridge.getCapacity();
      console.log(c);
      this.mtrgCapacity = c[0].capacity;
      this.mtrgUsed = c[0].used;
    } catch (e) {
      console.log(e);
    }
  }

  async send() {
    console.log("SENDING !!! ");
    this.errMsg = "";
    if (!(this.$refs.form as any).validate()) {
      return;
    }
    const capacityReached = await this.reachedCapacity(
      this.amount!,
      this.token.symbol
    );
    if (capacityReached) {
      this.errMsg =
        "MTRG capacity is reached, please make a transfer with smaller amount";
      return;
    }
    const b = await this.hasEnoughBalance(
      this.wallets[this.from],
      this.amount!,
      this.token.symbol
    );
    if (!b) {
      this.errMsg = `Not enough balance for transfer amount`;
      return;
    }

    try {
      const value =
        "0x" +
        new BigNumber("1" + "0".repeat(18))
          .times(this.amount!)
          .integerValue()
          .toString(16);
      let tokenValue = this.token.symbol == "MTRG" ? 1 : 0;
      console.log("TOKEN_VAL=", tokenValue);

      await flex.vendor
        .sign("tx")
        .signer(this.wallets[this.from].address!)
        .request([
          {
            to: this.to,
            value,
            token: tokenValue,
            data: "0x",
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
