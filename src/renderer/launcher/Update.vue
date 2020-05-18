<template>
  <v-layout column>
    <v-subheader>General</v-subheader>
    <v-card>
      <v-card-text>
        <span>About Meter</span>
        <br />
        <span class="grey--text text--darken-1">Wallet {{getVersion()}} / Flex {{flexVersion}}</span>
      </v-card-text>
      <v-divider />
      <v-list>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title class="grey--text text--darken-3">Check Update</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            {{autoUpdateStatusText}}
            <v-btn
              style="text-transform:none"
              flat
              small
              color="primary"
              :disabled="!autoUpdateAction"
              @click="autoUpdateAction"
            >{{autoUpdateActionName}}</v-btn>
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

const updateChecker = remote.app.EXTENSION.updateChecker;

@Component
export default class AutoUpdate extends Vue {
  name = "auto_update";
  flexVersion = flex.version;
  updater = {
    status: updateChecker.status,
    newVersion: updateChecker.newVersion,
    error: updateChecker.error
  };

  getVersion() {
    return remote.app.getVersion();
  }

  get autoUpdateStatusText() {
    if (this.updater.status === "downloaded" && this.updater.newVersion) {
      return `New version ${this.updater.newVersion.version} available!`;
    }
    if (this.updater.error) {
      return "Error occurred";
    }
    if (this.updater.status === "idle") {
      return "Already up to date";
    }
  }

  get autoUpdateActionName() {
    switch (this.updater.status) {
      case "idle":
        return "Check";
      case "checking":
        return "Checking…";
      case "downloading":
        return "Downloading…";
      case "downloaded":
        return "Quit and Install";
    }
  }

  get autoUpdateAction() {
    switch (this.updater.status) {
      case "idle":
        return () => {
          updateChecker.check();
          this.updater = {
            status: updateChecker.status,
            newVersion: updateChecker.newVersion,
            error: updateChecker.error
          };
        };
      case "checking":
        return undefined;
      case "downloading":
        return undefined;
      case "downloaded":
        return () => updateChecker.quitAndInstall();
    }
  }

  @State
  preferencesRevision!: number;
}
</script>
