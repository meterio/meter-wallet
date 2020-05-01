<template>
  <v-layout column>
    <v-subheader>General</v-subheader>
    <v-card>
      <v-card-text>
        <span>About Meter</span>
        <br />
        <span class="grey--text text--darken-1">Wallet {{getVersion()}} / Flex {{connexV}}</span>
      </v-card-text>
      <v-divider />
      <v-list>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title class="grey--text text--darken-3">Check Update</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn
              color="primary"
              small
              class="font-weight-regular"
              @click.stop="checkUpdate"
              flat
              ripple
            >Check</v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-card>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component, Watch, Emit } from "vue-property-decorator";
import { State } from "vuex-class";
import { remote } from "electron";

@Component
export default class AutoUpdate extends Vue {
  name = "auto_update";
  connexV = flex.version;

  getVersion() {
    return remote.app.getVersion();
  }
  @State
  preferencesRevision!: number;
}
</script>
