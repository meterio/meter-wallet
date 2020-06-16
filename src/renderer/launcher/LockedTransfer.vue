<template>
  <v-layout column align-center>
    <v-layout column align-center style="max-width:1000px;width:100%;" pa-3>
      <div class="subheading py-4">Transfer from</div>
      <WalletSeeker style="width:270px" full-size :wallets="wallets" v-model="from" />
      <v-card flat tile style="width:500px;" class="mt-4 py-2 px-2 outline">
        <v-card-title class="subheading">To</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-menu
              v-model="showHistory"
              style="width:100%;"
              class="unset-cursor"
              :open-on-click="false"
              offset-y
              :nudge-top="18"
            >
              <v-text-field
                ref="address"
                slot="activator"
                :rules="addressRules"
                validate-on-blur
                label="Recipient Address"
                v-model="to"
                append-icon="mdi-history"
                @click:append="onClickHistoryIcon"
              />
              <v-list two-line>
                <template v-for="(item,i) in history">
                  <v-divider v-if="i>0" :key="item.addr + '-divider'" />
                  <v-list-tile :key="item.addr" @click="selectAddress(item.addr)">
                    <v-list-tile-content>
                      <v-list-tile-title>{{item.addr}}</v-list-tile-title>
                      <v-list-tile-sub-title v-show="!!item.walletName">
                        <v-layout align-center>
                          <AddressLabel
                            icon
                            class="mr-2"
                            style="width:30px;height:20px;border-radius:3px;"
                          >{{item.addr}}</AddressLabel>
                          {{item.walletName}}
                        </v-layout>
                      </v-list-tile-sub-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </template>
              </v-list>
            </v-menu>

            <v-text-field
              validate-on-blur
              type="number"
              label="Lock Epoch"
              :rules="epochRules"
              v-model="lockEpoch"
            />

            <v-text-field
              validate-on-blur
              type="number"
              label="Release Epoch"
              :rules="epochRules"
              v-model="releaseEpoch"
            />

            <v-text-field
              validate-on-blur
              type="number"
              label="Locked MTR Amount"
              suffix="MTR"
              :rules="amountRules"
              v-model="mtrLocked"
            />
            <v-text-field
              validate-on-blur
              type="number"
              label="Locked MTRG Amount"
              suffix="MTRG"
              :rules="amountRules"
              v-model="mtrgLocked"
            />

            <v-textarea ref="memo" label="Memo" :rules="memoRules" validate-on-blur v-model="memo"></v-textarea>
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

@Component
export default class LockedTransfer extends Vue {
  @State
  wallets!: entities.Wallet[];
  amount = "";
  to = "";
  from = 0;
  errMsg = "";
  lockEpoch = 0;
  releaseEpoch = 100;
  mtrLocked = 0;
  mtrgLocked = 0;
  showHistory = false;
  memo = "";
  history: {
    addr: string;
    walletName: string | null;
  }[] = [];

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

  readonly amountRules = [
    (v: string) => new BigNumber(0).lte(v) || "Invalid amount"
  ];

  readonly epochRules = [(v: number) => v > 0 || "Invalid epoch"];

  readonly memoRules = [(v: string) => true || "Invalid memo"];

  created() {
    let fromAddr = this.$route.query["from"];
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
      const value =
        "0x" +
        new BigNumber("1" + "0".repeat(18))
          .times(this.amount!)
          .integerValue()
          .toString(16);
      const dataBuffer = ScriptEngine.getLockedTransferData(
        this.lockEpoch,
        this.releaseEpoch,
        this.wallets[this.from].address!,
        this.to,
        this.mtrLocked,
        this.mtrgLocked,
        this.memo
      );
      const fromAddr = this.wallets[this.from].address!;
      await flex.vendor
        .sign("tx")
        .signer(fromAddr)
        .request([
          {
            to: fromAddr,
            value: "0",
            token: ScriptEngine.Token.Meter,
            data: "0x" + dataBuffer.toString("hex")
          }
        ]);
      this.$router.back();
    } catch (err) {
      this.errMsg = `${err.name}: ${err.message}`;
    }
  }

  async onClickHistoryIcon() {
    if (this.showHistory) {
      this.showHistory = false;
      return;
    }
    const txs = (await BDB.activities
      .where({ type: "tx" })
      .reverse()
      .limit(20)
      .toArray()) as entities.Activity<"tx">[];

    const addrs: string[] = [];
    txs
      .map(tx => (tx.data.receipt ? tx.data.receipt.outputs : []))
      .forEach(outputs => {
        outputs.forEach(output => {
          output.transfers.forEach(tr => {
            if (addrs.indexOf(tr.recipient) < 0) {
              addrs.push(tr.recipient);
            }
          });
        });
      });

    this.history = addrs
      .slice(0, 10)
      .map<LockedTransfer["history"][number]>(addr => {
        const wallet = this.wallets.find(wallet => addr === wallet.address);
        if (wallet) {
          return {
            addr: cry.toChecksumAddress(addr),
            walletName: wallet.name!
          };
        } else {
          return {
            addr: cry.toChecksumAddress(addr),
            walletName: null
          };
        }
      });
    (this.$refs.address as Vue).$el.querySelector("input")!.focus();
    this.showHistory = true;
  }

  selectAddress(addr: string) {
    this.to = addr;
    (this.$refs.address as Vue).$el.querySelector("input")!.focus();
  }
}
</script>

<style scoped>
.unset-cursor >>> * {
  cursor: unset;
}
</style>
