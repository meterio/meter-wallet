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
          <div>Type:</div>
          <div>Created At:</div>
          <div>Nonce:</div>
          <div>Unbounded:</div>
          <div v-if="bucket.unbounded">Mature At:</div>
        </v-flex>
        <v-flex class="pa-4 pl-0">
          <div>{{ bucket.id }}</div>
          <div>{{ bucket.owner }}</div>
          <div>{{ bucket.candidate }}</div>
          <div>
            <Amount sym="MTRG">{{ bucket.votes }}</Amount>
          </div>
          <div>
            <Amount sym="MTRG">{{ bucket.bonus }}</Amount>
          </div>
          <div>
            <Amount sym="MTRG">{{ bucket.totalVotes }}</Amount>
          </div>
          <div>{{ bucket.option }}</div>
          <div>{{ bucket.autobid >= 100 ? "autobid" : "userbid" }}</div>
          <div>{{ bucket.createTime }}</div>
          <div>{{ bucket.nonce }}</div>
          <div>{{ bucket.unbounded }}</div>
          <div v-if="bucket.unbounded">{{ bucket.matureTime | fromNow }}</div>
        </v-flex>
      </v-layout>

      <v-layout row justify-center>
        <v-flex class="pa-4">
          <router-link
            tag="span"
            :to="{
              name: 'delegate',
              params: { id: bucket.id },
            }"
          >
            <v-btn depressed small color="info">Delegate</v-btn>
          </router-link>

          <router-link
            v-if="isZeroCandidate && !bucket.unbounded"
            tag="span"
            :to="{
              name: 'unbound',
              params: { id: bucket.id },
            }"
          >
            <v-btn depressed small color="primary">Unbound</v-btn>
          </router-link>

          <router-link
            v-else
            tag="span"
            :to="{
              name: 'undelegate',
              params: { id: bucket.id },
            }"
          >
            <v-btn depressed small color="primary">Unvote</v-btn>
          </router-link>
        </v-flex>
      </v-layout>
    </v-card>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";

@Component
export default class Bucket extends Vue {
  @State
  buckets!: entities.Bucket[];

  id = "";
  bucket = {} as entities.Bucket;

  get isZeroCandidate() {
    return (
      this.bucket.candidate === "0x0000000000000000000000000000000000000000"
    );
  }

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
