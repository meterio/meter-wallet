<template>
  <div>
    <v-layout align-center>
      <v-layout justify-center>
        <img :src="logoUrl" style="height: 10rem; margin: 6rem 0 0 0" />
      </v-layout>
    </v-layout>
    <div style="max-width: 600px; width: 100%; margin: 0 auto">
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
    Update,
  },
})
export default class Settings extends Vue {
  name: string = "settings";
  active = 0;
  tabs = ["Shortcuts", "Networks", "Update"];
  logoUrl = env.logoUrl;
}
</script>
