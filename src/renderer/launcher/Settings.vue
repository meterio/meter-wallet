<template>
  <div>
    <v-layout align-center>
      <v-layout column>
        <v-layout justify-center>
          <img :src="logoUrl" style="height:12rem;margin:3rem 0 2rem 0;" />
        </v-layout>
      </v-layout>
    </v-layout>
    <div style="max-width: 800px; width: 100%; margin: 0 auto;">
      <div>
        <Update></Update>
      </div>
      <div>
        <Nodes></Nodes>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Nodes from "./Nodes.vue";
import Update from "./Update.vue";
import env from "@/env";

@Component({
  components: {
    Nodes,
    Update
  }
})
export default class Settings extends Vue {
  name: string = "settings";
  active = 0;
  tabs = ["Shortcuts", "Networks", "Update"];
  logoUrl = env.logoUrl;
}
</script>
