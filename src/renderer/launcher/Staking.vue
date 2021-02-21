<template>
  <v-layout column align-center>
    <v-layout column style="max-width: 1000px; width: 100%">
      <div class="pa-3">
        <v-layout justify-center>
          <img :src="logoUrl" style="height: 12rem; margin: 3rem 0 2rem 0" />
        </v-layout>
        <v-layout justify-center>
          <!-- <v-btn small class="caption" color="primary" @click="onCreate">New</v-btn> -->
        </v-layout>
      </div>
      <div>
        <v-layout row wrap justify-center="true">
          <table>
            <thead>
              <th>Candidate</th>
              <th>Address</th>
              <th>Total Votes</th>
              <th>Action</th>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
              </tr>
            </tbody>
          </table>
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
export default class Staking extends Vue {
  @State
  wallets!: entities.Wallet[];
  logoUrl = env.logoUrl;

  created() {
    flex.meter
      .candidates()
      .then((res) => {
        this.$store.state.candidateList = res;
      })
      .catch((err) => {});
  }
}
</script>
