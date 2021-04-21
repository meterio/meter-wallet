<template>
  <v-expansion-panel-content v-bind="$attrs" v-on="$listeners" expand-icon>
    <v-layout row slot="header" align-center>
      <v-layout column>
        <v-layout row align-center>
          <b class="label primary mr-2">TX</b>
          <div class="text-truncate">{{ comment }}</div>
          <b v-show="reverted" class="label warning">Reverted</b>
          <v-spacer />
          <span class="caption grey--text">{{ time }}</span>
        </v-layout>
      </v-layout>

      <v-tooltip bottom>
        <v-btn
          slot="activator"
          icon
          small
          flat
          @click.stop="resend"
          class="my-0"
          style="margin-right: -8px"
          :style="{ 'pointer-events': canResend ? '' : 'none' }"
        >
          <v-icon small :color="iconColor">{{ icon }}</v-icon>
        </v-btn>
        <span>{{ statusTip }}</span>
      </v-tooltip>
    </v-layout>
    <v-card class="text-truncate">
      <v-card-text class="pt-1">
        <v-layout align-center mb-2>
          <AddressLabel
            icon
            style="width: 27px; height: 18px; border-radius: 3px"
            >{{ signer }}</AddressLabel
          >
          <span class="px-2 subheading">{{ walletName }}</span>
        </v-layout>
        <v-layout>
          <span class="caption grey--text">Amount</span>
          <v-spacer />
          <Amount v-if="token == 1" sym="MTRG" prepend="-">{{ amount }}</Amount>
          <Amount v-else sym="MTR" prepend="-">{{ amount }}</Amount>
        </v-layout>
        <v-layout>
          <span class="caption grey--text">{{ fee ? "Fee" : "Est. fee" }}</span>
          <v-spacer />
          <Amount sym=" MTR" prepend="-">{{ fee || estimatedFee }}</Amount>
        </v-layout>

        <v-layout>
          <span class="caption grey--text">Priority</span>
          <v-spacer />
          <Priority :readonly="true" :priority="gasPriceCoef" />
        </v-layout>
        <div>
          <a class="caption" @click="insight">
            <v-icon style="font-size: 110%; color: currentColor">search</v-icon>
            {{ txid | shortTxId }}
          </a>
          <v-tooltip bottom>
            <v-btn
              flat
              small
              icon
              slot="activator"
              class="ma-0 ml-3"
              v-clipboard="txid"
              @click="textTip = 'Copied'"
              @mouseover="textTip = 'Copy Tx Id'"
            >
              <v-icon small style="font-size: 12px">mdi-content-copy</v-icon>
            </v-btn>
            <span>{{ textTip }}</span>
          </v-tooltip>
        </div>
        <div
          v-show="!!errorMessage"
          class="error--text"
          style="font-size: 12px"
        >
          <v-icon style="font-size: 12px; color: currentColor"
            >mdi-alert</v-icon
          >
          {{ errorMessage }}
        </div>

        <!--
        <div v-show="!!hostname" class="py-1">
          <a class="caption text-truncate" @click="reveal">
            <v-icon style="font-size:100%;color:currentColor">mdi-link-variant</v-icon>
            {{hostname}}
          </a>
        </div>
        -->
      </v-card-text>
    </v-card>
  </v-expansion-panel-content>
</template>
<script lang="ts">
import { Vue, Component, Prop, Emit } from "vue-property-decorator";
import { remote, clipboard } from "electron";
import { describeClauses } from "@/common/formatter";
import { hostnameOf } from "@/common/url-utils";
import { Transaction } from "@meterio/devkit";
import BigNumber from "bignumber.js";
import { format } from "timeago.js";

@Component
export default class TxActivityItem extends Vue {
  @Prop(Object)
  item!: entities.Activity<"tx">;

  resendCount = 0;
  textTip = "";

  get txObject() {
    return Transaction.decode(Buffer.from(this.item.data.raw.slice(2), "hex"));
  }
  get comment() {
    return this.item.data.comment || describeClauses(this.item.data.message);
  }
  get hostname() {
    return hostnameOf(this.item.referer.url);
  }
  get reverted() {
    return this.item.data.receipt ? this.item.data.receipt.reverted : false;
  }
  get time() {
    this.$store.state.syncStatus; // pulse
    return format(this.item.createdTime);
  }
  get txid() {
    return this.item.data.id;
  }
  get signer() {
    return this.item.data.signer;
  }
  get gasPriceCoef() {
    return this.txObject.body.gasPriceCoef;
  }
  get estimatedFee() {
    return this.item.data.estimatedFee;
  }
  get fee() {
    return this.item.data.receipt ? this.item.data.receipt.paid : "";
  }
  get amount() {
    return (
      "0x" +
      this.item.data.message
        .reduce((sum: BigNumber, c: any) => {
          return sum.plus(c.value);
        }, new BigNumber(0))
        .toString(16)
    );
  }

  get token() {
    return this.item.data.message && this.item.data.message.length > 0
      ? this.item.data.message[0].token
      : 0;
  }

  get walletName() {
    const wallets = this.$store.state.wallets as entities.Wallet[];
    const wallet = wallets.find((w) => w.address === this.signer);
    return wallet ? wallet.name : "Unknown";
  }

  get status() {
    this.resendCount;
    this.$store.state.syncStatus; // pulse
    const headTs = this.$store.state.chainHead.timestamp as number;
    if (this.item.data.receipt) {
      return this.item.closed ? "confirmed" : "confirming";
    } else if (this.item.closed) {
      return "dropped";
    }

    const qStatus = remote.app.EXTENSION.txer.status(this.item.data.id);
    if (!qStatus) {
      return "hanging";
    }
    if (qStatus === "error") {
      return "error";
    }

    if (qStatus === "sent" && headTs > this.item.data.timestamp + 10 * 60) {
      return "timeout";
    }

    return "sending";
  }

  get errorMessage() {
    if (this.status in ["confirmed", "confirming", "dropped"]) {
      return "";
    }
    return remote.app.EXTENSION.txer.errorMessage(this.item.data.id);
  }

  get icon() {
    switch (this.status) {
      case "confirmed":
        return "mdi-check-circle-outline";
      case "confirming":
        return "mdi-progress-check";
      case "sending":
        return "mdi-progress-upload";
      case "dropped":
        return "mdi-alert-circle-outline";
      default:
        return "mdi-restart";
    }
  }
  get statusTip() {
    switch (this.status) {
      case "confirmed":
      case "confirming":
      case "sending":
      case "dropped":
        return this.status;
      default:
        return "error happened, you can click to resend it";
    }
  }
  get iconColor() {
    switch (this.status) {
      case "confirmed":
        return "success";
      case "confirming":
        return "info";
      case "sending":
        return "info";
      default:
        return "error";
    }
  }
  get canResend() {
    return this.icon === "mdi-restart";
  }

  @Emit("action")
  emitAction() {}

  resend() {
    remote.app.EXTENSION.txer.enqueue(
      this.item.data.id,
      this.item.data.raw,
      NODE_CONFIG.url
    );
    this.$store.commit("updateTxResendTime", {
      id: this.item.data.id,
      value: Date.now() / 1000,
    });
  }

  reveal() {
    let href: string;
    if (this.item.data.link) {
      href = this.item.data.link.replace("{txid}", this.txid);
    } else {
      href = this.item.referer.url;
    }
    BUS.$emit("open-tab", { href });
    this.emitAction();
  }

  insight() {
    const href = `https://insight.meter.io/#/txs/${this.txid}`;
    BUS.$emit("open-tab", { href });
    this.emitAction();
  }
}
</script>
