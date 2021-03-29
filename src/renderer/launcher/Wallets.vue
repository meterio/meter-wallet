<template>
  <v-layout column align-center pa-5>
    <v-layout column style="max-width: 1000px; width: 100%">
      <div class="mt-4">
        <v-layout justify-center>
          <v-btn flat small class="caption" color="primary" @click="onCreate"
            >New</v-btn
          >
          <v-btn flat small class="caption" color="primary" @click="onImport"
            >Import</v-btn
          >
          <router-link tag="span" to="/transfer">
            <v-btn flat small class="caption" color="primary">Transfer</v-btn>
          </router-link>
          <!--
          <router-link tag="span" to="/auction/bid">
            <v-btn flat small class="caption" color="primary">Bid</v-btn>
          </router-link>
          <router-link tag="span" to="/staking/uncandidate">
            <v-btn flat small class="caption" color="primary">Uncandidate</v-btn>
          </router-link>
          <router-link tag="span" to="/staking/bound">
            <v-btn flat small class="caption" color="primary">Bound</v-btn>
          </router-link>
          <router-link tag="span" to="/staking/unbound">
            <v-btn flat small class="caption" color="primary">Unbound</v-btn>
          </router-link>
          <router-link tag="span" to="/staking/delegate">
            <v-btn flat small class="caption" color="primary">Delegate</v-btn>
          </router-link>
          <router-link tag="span" to="/staking/undelegate">
            <v-btn flat small class="caption" color="primary">Undelegate</v-btn>
          </router-link>
          -->
        </v-layout>
      </div>
      <div>
        <v-layout row wrap :justify-center="wallets.length < 4">
          <v-flex
            v-for="wallet in wallets"
            :key="wallet.address"
            xs3
            class="py-3"
          >
            <WalletCard
              flat
              class="outline"
              style="border-radius: 9px; max-width: 200px; margin: auto"
              @click.native="onClick(wallet.address)"
              :wallet="wallet"
              ripple
            ></WalletCard>
          </v-flex>
        </v-layout>
      </div>
    </v-layout>
    <v-spacer />
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { ImportWalletDialog, CreateWalletDialog } from "@/renderer/components";
import { State } from "vuex-class";
import env from "@/env";

@Component
export default class Wallets extends Vue {
  @State
  wallets!: entities.Wallet[];
  logoUrl = env.logoUrl;

  onClick(address: string) {
    this.$router.push({
      name: "wallet-detail",
      params: {
        address,
      },
    });
  }

  onImport() {
    this.$dialog(ImportWalletDialog, null);
  }

  onCreate() {
    this.$dialog(CreateWalletDialog, undefined);
  }
}
</script>
