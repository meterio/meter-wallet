<template >
  <v-expansion-panel-content v-bind="$attrs" v-on="$listeners">
    <v-layout column slot="header">
      <v-layout row align-baseline>
        <span class="grey--text caption">Clause {{ index + 1 }}</span>
        <v-spacer />
        <b class="label primary text-uppercase">{{ type }}</b>
      </v-layout>
      <v-layout row align-baseline>
        <span class="caption">
          To:
          <AddressLabel placeholder="New contract">{{
            clause.to
          }}</AddressLabel>
        </span>
        <v-spacer />
        <Amount v-if="clause.token == 1" sym="MTRG" class="body-1">{{
          clause.value
        }}</Amount>
        <Amount v-if="clause.token == 0" sym="MTR" class="body-1">{{
          clause.value
        }}</Amount>
      </v-layout>
    </v-layout>
    <v-card style="word-break: break-all">
      <v-card-text class="pt-1">
        <i>{{ clause.comment }}</i>
      </v-card-text>
      <v-card-text v-show="!!clause.data" class="pt-0">
        <v-textarea
          tabindex="-1"
          class="caption"
          box
          readonly
          :value="clause.data"
          label="Input Data"
          style="font-family: 'Roboto Mono', monospace"
        ></v-textarea>
        <div v-if="decoded">
          Decoded {{ decoded.op }} Data:
          <pre style="font-size: 90%; font-family: 'Roboto Mono', monospace">{{
            decoded.text
          }}</pre>
        </div>
      </v-card-text>
    </v-card>
  </v-expansion-panel-content>
</template>
<script lang="ts">
import { Vue, Component, Model, Prop } from "vue-property-decorator";
type ClauseType = Flex.Vendor.TxMessage[number];
import { ScriptEngine } from "@meterio/devkit";
import { Script } from "vm";

@Component
export default class ClauseItem extends Vue {
  @Prop(Object)
  clause!: ClauseType;
  @Prop(Number)
  index!: number;

  get type() {
    if (!this.clause.to) {
      return "Create";
    }

    if (this.clause.data !== "0x") {
      return "Call";
    }
    return "Transfer";
  }

  get decoded() {
    if (this.clause.data === "0x") {
      return undefined;
    }
    try {
      const scriptData = ScriptEngine.decodeScriptData(this.clause.data);
      if (scriptData.header.modId === ScriptEngine.ModuleID.Staking) {
        const body = ScriptEngine.decodeStakingBody(scriptData.payload);
        const j = ScriptEngine.jsonFromStakingBody(body);
        return {
          op: ScriptEngine.explainStakingOpCode(j.opCode),
          text: JSON.stringify(j, null, 2),
        };
      }
      if (scriptData.header.modId === ScriptEngine.ModuleID.Auction) {
        const body = ScriptEngine.decodeAuctionBody(scriptData.payload);
        const j = ScriptEngine.jsonFromAuctionBody(body) as any;
        return {
          op: ScriptEngine.explainAuctionOpCode(j.opCode, j.option),
          text: JSON.stringify(j, null, 2),
        };
      }
      if (scriptData.header.modId === ScriptEngine.ModuleID.AccountLock) {
        const body = ScriptEngine.decodeAccountLockBody(scriptData.payload);
        const j = ScriptEngine.jsonFromAccountLockBody(body) as any;
        return {
          op: ScriptEngine.explainAccountLockOpCode(j.opCode),
          text: JSON.stringify(j, null, 2),
        };
      }
    } catch (e) {
      return undefined;
    }
  }
}
</script>
