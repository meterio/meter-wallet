<template>
  <v-layout v-if="bucketNotFound" column align-center>
    Bucket with id {{ stakingID }} is not found
  </v-layout>
  <v-layout v-else column align-center>
    <v-layout v-if="addressNotFound" column align-center>
      Bucket owner address {{ holderAddr }} is not found
    </v-layout>
    <v-layout
      v-else
      column
      align-center
      style="max-width: 1000px; width: 100%"
      pa-3
    >
      <div class="subheading py-4"></div>
      <WalletSeeker
        style="width: 270px"
        full-size
        :wallets="wallets"
        v-model="from"
        disabled
      />
      <v-card flat tile style="width: 500px" class="mt-4 py-2 px-2 outline">
        <v-card-title class="subheading"
          >Delegate locked bucket to candidate</v-card-title
        >
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              ref="stakingID"
              :rules="stakingIDRules"
              validate-on-blur
              label="Staking ID"
              v-model="stakingID"
              disabled
            />
            <v-text-field
              validate-on-blur
              label="Amount"
              v-bind:suffix="token"
              :rules="amountRules"
              v-model="amount"
              disabled
            />
            <!--<v-text-field
              validate-on-blur
              type="string"
              label="Candidate Address"
              v-model="candAddr"
              :autofocus="true"
            />
            -->
            <v-select
              :items="candidatesList"
              small
              v-model="candAddr"
              label="Candidate"
              item-text="text"
              item-value="value"
              :autofocus="true"
            ></v-select>
            <v-checkbox label="Enable auto-bid" v-model="autobid"> </v-checkbox>
            <!-- <v-select :items="items" label="Token" v-model="token"></v-select> -->
          </v-form>
        </v-card-text>
        <v-card-actions>
          <div class="error--text">{{ errMsg }}</div>
          <v-spacer />
          <v-btn flat class="primary" @click="send">Send</v-btn>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-layout>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import BigNumber from "bignumber.js";
import { cry, ScriptEngine } from "@meterio/devkit";

@Component
export default class StakingDelegate extends Vue {
  @State
  wallets!: entities.Wallet[];

  @State
  candidates!: entities.Candidate[];

  @State
  buckets!: entities.Bucket[];

  get candidatesList() {
    return this.candidates.map((c) => {
      return {
        text:
          c.name +
          "   (" +
          c.address.substr(0, 8) +
          "..." +
          c.address.substr(c.address.length - 6) +
          ")",
        value: c.address,
      };
    });
  }
  amount = "0";
  stakingID = "";
  from = 0;
  errMsg = "";
  token = "MTRG";
  autobid = true;
  /*
  items = [
    { text: "Meter Governance Token (MTRG)", value: "MTRG" },
    { text: "Meter Token", value: "MTR" }
  ];
  */
  optionVal = 1;
  candAddr = "";
  holderAddr = "";
  bucketNotFound = false;
  addressNotFound = false;

  readonly addressRules = [
    (v: string) => !!v || "Input address here",
    (v: string) => {
      if (!cry.isAddress(v)) {
        return "Invalid address";
      }
      if (v !== v.toLowerCase() && cry.toChecksumAddress(v) !== v) {
        return "Checksum incorrect";
      }
      return true;
    },
  ];
  readonly stakingIDRules = [(v: string) => !!v || "Input staking ID here"];
  readonly amountRules = [
    (v: number) => new BigNumber(0).lte(v) || "Invalid amount",
  ];

  async created() {
    const buckets = await flex.meter.buckets();
    this.$store.commit("updateBuckets", buckets);

    const candidates = await flex.meter.candidates();
    this.$store.commit("updateCandidates", candidates);

    const id = this.$route.params.id;

    let bucket = undefined;
    for (const b of buckets) {
      if (b.id.toLowerCase() == id) {
        bucket = b;
        break;
      }
    }

    if (!bucket) {
      this.bucketNotFound = true;
    } else {
      const amount = new BigNumber(bucket.value).dividedBy(1e18).toFixed();
      this.stakingID = id;
      this.amount = amount;
      let holderAddr = bucket.owner.toLowerCase();
      if (holderAddr) {
        const index = this.wallets.findIndex(
          (wallet) => wallet.address === holderAddr
        );
        if (index >= 0) {
          this.from = index;
        } else {
          this.holderAddr = holderAddr;
          this.addressNotFound = true;
        }
        this.candAddr = holderAddr;
      }
    }
  }

  async send() {
    this.errMsg = "";
    if (!(this.$refs.form as any).validate()) {
      return;
    }
    try {
      const value = new BigNumber("1" + "0".repeat(18))
        .times(this.amount!)
        .integerValue()
        .toString(10);
      let holderAddr = this.wallets[this.from].address!;
      const dataBuffer = ScriptEngine.getDelegateData(
        holderAddr,
        this.candAddr,
        this.stakingID,
        value,
        undefined,
        undefined,
        this.autobid ? 100 : 0
      );

      await flex.vendor
        .sign("tx")
        .signer(holderAddr)
        .request([
          {
            to: holderAddr,
            value: "0",
            token: ScriptEngine.Token.MeterGov,
            data: "0x" + dataBuffer.toString("hex"),
          },
        ]);
      this.$router.back();
    } catch (err) {
      this.errMsg = `${err.name}: ${err.message}`;
    }
  }
}
</script>

<style scoped>
.unset-cursor >>> * {
  cursor: unset;
}
</style>
