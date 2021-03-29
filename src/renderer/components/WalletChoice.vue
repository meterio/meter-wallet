<template>
  <v-layout column>
    <v-layout row>
      <AddressLabel
        class="my-2"
        style="width: 60px; height: 40px; border-radius: 5px"
        icon
        >{{ wallet.address }}</AddressLabel
      >
      <v-card class="elevation-0 pl-2 py-1" :style="{ width: '100%' }">
        <v-card-title class="pa-0">
          <span class="d-block bold">{{ wallet.name }}</span>
        </v-card-title>

        <v-card-text class="pa-0">
          {{ wallet.address }}
        </v-card-text>
      </v-card>
    </v-layout>

    <v-card
      class="elevation-0"
      :style="{ borderTop: '1px dotted rgba(0,0,0,0.14)' }"
    >
      <v-card-text class="pa-0 pt-2">
        <v-layout column>
          <v-layout justify-space-between>
            <Amount sym="MTR">{{ mtrBalance }}</Amount>
            <Amount sym="MTRG">{{ mtrgBalance }}</Amount>
          </v-layout>
          <v-layout justify-space-between>
            <span></span>
            <Amount sym="MTRG" :bounded="true">{{ boundMTRGBalance }}</Amount>
          </v-layout>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-layout>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from "vue-property-decorator";
import AccountLoader from "../mixins/account-loader";

@Component
export default class WalletCard extends Mixins(AccountLoader) {
  @Prop(Object)
  wallet!: entities.Wallet;

  @Prop(Boolean)
  compact!: boolean;

  get address() {
    return this.wallet.address!;
  }
  get mtrgBalance() {
    return this.account && this.account.balance;
  }
  get mtrBalance() {
    return this.account && this.account.energy;
  }
  get boundMTRGBalance() {
    return this.account && this.account.boundbalance;
  }
  get boundMTRBalance() {
    return this.account && this.account.boundenergy;
  }
}
</script>
