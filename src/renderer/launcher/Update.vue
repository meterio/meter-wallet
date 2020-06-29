<template>
  <v-layout column>
    <v-subheader>General</v-subheader>
    <v-card>
      <v-list two-line class="card-border">
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title class="grey--text text--darken-3">
              Version
              <span class="grey--text ml-2 v-list__tile__sub-title">{{autoUpdateStatusText}}</span>
            </v-list-tile-title>
            <v-list-tile-sub-title>Wallet {{walletVersion}} / Flex {{flexVersion}}</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
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
  updater = {
    status: updateChecker.status,
    newVersion: updateChecker.newVersion,
    error: updateChecker.error,
    progress: updateChecker.downloadProgress
  };

  get walletVersion() {
    return remote.app.getVersion();
  }
  get flexVersion() {
    return flex.version;
  }

  get autoUpdateStatusText() {
    if (this.updater.status === "downloaded" && this.updater.newVersion) {
      return `New version ${this.updater.newVersion.version} available!`;
    }
    if (this.updater.error) {
      return "Error occurred:" + this.updater.error.message;
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
        return `Downloading… ${Math.floor(this.updater.progress * 100) / 100}%`;
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
            error: updateChecker.error,
            progress: updateChecker.downloadProgress
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

  timer: any;
  created() {
    this.timer = setInterval(() => {
      this.updater = {
        status: updateChecker.status,
        newVersion: updateChecker.newVersion,
        error: updateChecker.error,
        progress: updateChecker.downloadProgress
      };
    }, 2000);
  }
  destroyed() {
    clearInterval(this.timer);
  }

  @State
  preferencesRevision!: number;
}
</script>
