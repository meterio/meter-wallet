<template>
  <div class="pa-5">
    <div style="max-width: 1000px; width: 100%; margin: 20px auto">
      <div v-if="wallet">
        <v-layout justify-center>
          <v-btn right color="primary" @click="showReset" flat small
            >Reset Password</v-btn
          >
          <v-btn right color="error" flat @click="showDelete" small
            >Delete</v-btn
          >
          <v-btn
            flat
            small
            right
            class="caption"
            color="primary"
            @click="showExport"
            >Backup</v-btn
          >
          <router-link
            tag="span"
            :to="{ name: 'transfer', query: { from: wallet.address } }"
          >
            <v-btn flat small class="caption" color="primary">transfer</v-btn>
          </router-link>
        </v-layout>
      </div>
      <v-card class="elevation-0" v-if="wallet">
        <v-layout justify-space-around>
          <v-flex xs9>
            <v-list>
              <v-list-tile avatar>
                <v-list-tile-avatar :size="90">
                  <AddressLabel
                    style="width: 70px; height: 50px; border-radius: 5px"
                    icon
                    >{{ wallet.address }}</AddressLabel
                  >
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-card class="elevation-0">
                    <v-card-title class="pa-0 pt-1">
                      <input
                        single-line
                        class="editable-name"
                        hide-details
                        v-focus
                        v-if="isEdit"
                        maxlength="50"
                        @keyup.enter="editSave"
                        @blur="rollback"
                        v-model="walletName"
                      />
                      <span
                        style="max-width: 300px"
                        class="d-block text-truncate"
                        v-if="!isEdit"
                        >{{ wallet.name }}</span
                      >
                      <v-icon
                        class="ml-1"
                        @click="isEdit = true"
                        v-if="!isEdit"
                        small
                        >mdi-square-edit-outline</v-icon
                      >
                    </v-card-title>
                    <v-card-text class="caption pa-0">
                      <v-layout row align-content-center>
                        <v-flex align-self-center>
                          <AddressLabel class="grey--text text--darken-1">{{
                            wallet.address
                          }}</AddressLabel>
                        </v-flex>
                        <v-flex>
                          <v-tooltip top>
                            <v-btn
                              class="ma-0 ml-3"
                              v-clipboard="wallet.address"
                              @click="textTip = 'Copied'"
                              @mouseover="textTip = 'Copy'"
                              slot="activator"
                              small
                              icon
                            >
                              <v-icon small>mdi-content-copy</v-icon>
                            </v-btn>
                            <span>{{ textTip }}</span>
                          </v-tooltip>
                          <QRCodeDialog
                            width="300"
                            :size="270"
                            :content="wallet.address"
                          >
                            <div slot="activator">
                              <v-tooltip top>
                                <v-btn class="ma-0" slot="activator" small icon>
                                  <v-icon small>mdi-qrcode</v-icon>
                                </v-btn>
                                <span>Show QR code</span>
                              </v-tooltip>
                            </div>
                          </QRCodeDialog>
                        </v-flex>
                      </v-layout>
                    </v-card-text>
                  </v-card>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-flex>
          <v-flex xs3>
            <v-list class="mt-2">
              <v-list-tile>
                <v-divider inset vertical></v-divider>
                <v-list-tile-content>
                  <v-layout column style="width: 100%">
                    <v-flex class="text-xs-right">
                      <Amount sym="MTRG">{{ mtrgBalance }}</Amount>
                    </v-flex>
                    <v-flex class="text-xs-right">
                      <Amount sym="MTR">{{ mtrBalance }}</Amount>
                    </v-flex>
                  </v-layout>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-flex>
        </v-layout>
      </v-card>
      <v-layout justify-space-around>
        <v-flex xs9 sm10 class="mt-1">
          <h3 flat v-if="list.length" class="pl-0 pt-4 title d-inline-block">
            Recent Transfer
          </h3>
          <v-progress-circular
            class="ml-3"
            size="22"
            :width="2"
            v-if="isloading && list.length"
            indeterminate
            color="primary"
          ></v-progress-circular>
          <v-progress-linear
            v-if="isloading && !list.length"
            :indeterminate="true"
          ></v-progress-linear>
          <div v-if="!list.length" class="text-xs-center">
            <div style="margin-top: 130px">
              <v-icon style="font-size: 80px" color="grey lighten-2" medium left
                >search</v-icon
              >
              <br />
              <span>No logs display at this time!</span>
            </div>
            <v-btn
              class="mt-3"
              small
              :disabled="isloading"
              color="primary"
              @click="onLoadClick"
              >Load</v-btn
            >
          </div>
          <div style="background: #fff">
            <template v-for="(item, i) in list">
              <TransferItem
                style="border-radios"
                :isIn="item.sender !== address"
                :item="item"
                :key="i"
              />
              <v-divider
                timeout="3000"
                v-if="i !== list.length - 1"
                :key="`${i}-divider`"
                inset
              ></v-divider>
            </template>
          </div>
        </v-flex>
      </v-layout>
    </div>
    <v-snackbar v-model="snackbar" color="error" top>
      {{ errorMessage }}
      <v-btn flat dark @click="snackbar = false">close</v-btn>
    </v-snackbar>
  </div>
</template>
<script lang="ts">
import { Component, Watch, Mixins } from "vue-property-decorator";
import TransferMixin from "../mixins/Transfer.vue";
import { State } from "vuex-class";
import { ResetPwdDialog } from "@/renderer/components";
import { ExportWalletDialog } from "@/renderer/components";
import { DeleteWalletDialog } from "@/renderer/components";
import TransferItem from "./TransferItem.vue";
import AccountLoader from "../mixins/account-loader";

@Component({
  components: {
    TransferItem,
  },
})
export default class WalletDetail extends Mixins(TransferMixin, AccountLoader) {
  walletName?: string;
  list: Flex.Meter.Transfer[] = [];
  stick = false;
  snackbar = false;
  errorMessage = "";
  textTip = "Copy";
  isEdit = false;
  get address() {
    return (this.wallet ? this.wallet.address : "") || "";
  }
  isloading = false;

  @State
  wallets!: entities.Wallet[];

  @State
  chainHead!: Flex.Meter.Status["head"];

  @Watch("chainHead")
  onChainHeadChange() {
    if (!this.stick) {
      return;
    }
    this.getList();
  }

  rollback() {
    this.walletName = this.wallet!.name;
    this.isEdit = false;
  }

  editSave() {
    if (this.walletName && this.walletName !== this.wallet!.name) {
      BDB.wallets
        .where("id")
        .equals(this.wallet!.id!)
        .modify({ name: this.walletName });
    } else {
      this.walletName = this.wallet!.name;
    }

    this.isEdit = false;
  }

  get wallet() {
    return this.wallets.find((item) => {
      return item.address === this.$route.params.address;
    });
  }

  @Watch("wallet")
  walletChanged() {
    if (!this.wallet) {
      this.$router.back();
    }
  }

  created() {
    const address = this.$route.params.address;
    if (!this.wallet) {
      this.$router.back();
    }
    this.walletName = this.wallet!.name;
    this.createFilter(address);
  }

  async onLoadClick() {
    this.stick = true;
    await this.getList();
  }

  showReset() {
    this.$dialog(ResetPwdDialog, this.wallet!);
  }
  showDelete() {
    this.$dialog(DeleteWalletDialog, this.wallet!);
  }
  showExport() {
    this.$dialog(ExportWalletDialog, this.wallet!);
  }
  async getList() {
    let list: Flex.Meter.Transfer[] = [];
    this.resetPage();
    try {
      this.isloading = true;
      list = await this.getTransferDesc(256);
      this.isloading = false;
    } catch (error) {
      this.errorMessage = `${error.name}: ${error.message}`;
      this.list = [];
      this.snackbar = true;
      return;
    }

    this.list = list;
  }

  get mtrgBalance() {
    return this.account && this.account.balance;
  }

  get mtrBalance() {
    return this.account && this.account.energy;
  }
}
</script>
<style scoped>
input.editable-name {
  outline: #1976d2 solid 1px;
  padding-left: 5px;
}
</style>
