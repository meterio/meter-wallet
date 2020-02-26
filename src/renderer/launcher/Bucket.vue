<template>
  <v-layout column align-center justify-center>
    <h3 class="pa-3">Staking Bucket</h3>
    <v-card justify-start>
      <v-layout row justify-start>
        <v-flex class="pa-4">
          <div>Id:</div>
          <div>Owner:</div>
          <div>Candidate:</div>
          <div>Original Votes:</div>
          <div>Bonus Votes:</div>
          <div>Total Votes:</div>
          <div>Option:</div>
          <div>Created At:</div>
          <div>Mature At:</div>
          <div>Nonce:</div>
          <div>Unbounded:</div>
        </v-flex>
        <v-flex class="pa-4 pl-0">
          <div>{{bucket.id}}</div>
          <div>{{bucket.owner}}</div>
          <div>{{bucket.candidate}}</div>
          <div>{{bucket.votes/1e18}} MTRG</div>
          <div>{{bucket.bonus/1e18}} MTRG</div>
          <div>{{bucket.totalVotes/1e18}} MTRG</div>
          <div>{{bucket.option}}</div>
          <div>{{bucket.createTime}}</div>
          <div>{{bucket.matureTime}}</div>
          <div>{{bucket.nonce}}</div>
          <div>{{bucket.unbounded}}</div>
        </v-flex>
      </v-layout>
    </v-card>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import env from "@/env";

@Component
export default class Bucket extends Vue {
  @State
  buckets!: entities.Bucket[];

  @State
  candidates!: entities.Candidate[];
  id = "";
  bucket = {};

  created() {
    const id = this.$route.params.id;
    this.id = id;
    for (var i in this.buckets) {
      const bucket = this.buckets[i];
      if (bucket.id === id) {
        this.bucket = bucket;
      }
    }
  }
}
</script>
