<template>
  <v-card
    v-bind="$attrs"
    v-on="$listeners"
    :style="{ 'font-size': compact ? '90%' : 'inherit' }"
    style="cursor: default"
  >
    <IdentBox :text="wallet.address.toLowerCase()">
      <v-card-text class="white--text" :class="compact ? 'py-1' : 'py-2'">
        <v-layout column fill-height justify-center>
          <span
            class="text-truncate"
            :class="compact ? 'body-2' : 'subheading bold'"
            >{{ wallet.name }}</span
          >
          <AddressLabel abbrev class="mt-2 text-truncate caption">{{
            wallet.address
          }}</AddressLabel>
        </v-layout>
      </v-card-text>
    </IdentBox>
    <v-card-text class="py-1">
      <v-layout
        column
        align-end
        :style="{ 'line-height': compact ? '120%' : 'inherit' }"
      >
        <Amount sym="MTRG">{{ mtrgBalance }}</Amount>
        <Amount sym="MTR">{{ mtrBalance }}</Amount>
        <hr />
        <Amount sym="MTRG" :bounded="true">{{ boundMTRGBalance }}</Amount>
      </v-layout>
    </v-card-text>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, Mixins } from "vue-property-decorator";
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
