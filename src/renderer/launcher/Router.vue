<template>
  <div style="position:relative;width:100%;height:100%;">
    <transition
      :enter-active-class="`animated faster ${enterClass}`"
      :leave-active-class="`animated faster ${leaveClass}`"
    >
      <router-view style="position:absolute;left:0;top:0;right:0;bottom:0;overflow:auto" />
    </transition>
    <v-layout style="position:absolute;left:0;top:0">
      <router-link tag="span" to="/candidates">
        <v-btn flat class="ml-0">
          <v-icon small mr-5 style="margin-right:3px">mdi-account-multiple</v-icon>Candidates
        </v-btn>
      </router-link>
      <router-link tag="span" to="/buckets">
        <v-btn flat class="ml-0">
          <v-icon small mr-5 style="margin-right:3px">mdi-lock-outline</v-icon>Buckets
        </v-btn>
      </router-link>
      <router-link tag="span" to="/auction/present">
        <v-btn flat class="ml-0">
          <v-icon small mr-5 style="margin-right:3px">mdi-timelapse</v-icon>Auction
        </v-btn>
      </router-link>
    </v-layout>

    <v-layout style="position:absolute;right:0;top:0;">
      <router-link tag="span" to="/wallets">
        <v-btn flat class="ml-0">
          <v-icon small mr-5 style="margin-right:3px">mdi-cards</v-icon>Wallets
        </v-btn>
      </router-link>

      <router-link tag="span" to="/settings">
        <v-btn flat class="ml-0">
          <v-icon small style="margin-right:3px">mdi-settings</v-icon>Settings
        </v-btn>
      </router-link>

      <router-link tag="span" v-on:click.native="doSomethingCool" to>
        <v-btn flat class="ml-0">
          <v-icon small style="margin-right:3px">mdi-apps</v-icon>Explorer
        </v-btn>
      </router-link>
    </v-layout>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import VueRouter, { RouteConfig } from "vue-router";
import Portal from "./Portal.vue";
import Wallets from "./Wallets.vue";
import Staking from "./Staking.vue";
import WalletDetail from "./WalletDetail.vue";
import Settings from "./Settings.vue";
import Transfer from "./Transfer.vue";
import StakingCandidate from "./StakingCandidate.vue";
import StakingUncandidate from "./StakingUncandidate.vue";
import StakingBound from "./StakingBound.vue";
import StakingUnbound from "./StakingUnbound.vue";
import StakingDelegate from "./StakingDelegate.vue";
import StakingUndelegate from "./StakingUndelegate.vue";
import StakingCandidateUpdate from "./StakingCandidateUpdate.vue";
import SlashingBailOut from "./SlashingBailOut.vue";
import CandidateList from "./CandidateList.vue";
import BucketList from "./BucketList.vue";
import Bucket from "./Bucket.vue";
import StakingVote from "./StakingVote.vue";
import AuctionBid from "./AuctionBid.vue";
import PastAuctions from "./PastAuctions.vue";
import PresentAuction from "./PresentAuction.vue";
import LockedTransfer from "./LockedTransfer.vue";

@Component
export default class Router extends Vue {
  public static create(target: Vue) {
    return new Router({
      store: target.$store,
      router: new VueRouter({
        mode: "abstract",
        routes: routes
      })
    });
  }
  items = ["1", "2", "3"];
  historyIndex = 0;
  enterClass = "";
  leaveClass = "";

  doSomethingCool() {
    BUS.$emit("open-tab", {
      href: "https://insight.meter.io",
      mode: "inplace"
    });
  }

  @Watch("$route")
  routed() {
    const newIndex = this.$router.history.index;
    if (newIndex > this.historyIndex) {
      // forward
      this.enterClass = "slide-in";
      this.leaveClass = "fade-out";
    } else if (newIndex < this.historyIndex) {
      // backward
      this.enterClass = "fade-in";
      this.leaveClass = "slide-out";
    }
    this.historyIndex = newIndex;
  }
  on() {
    console.log("on !");
  }
}

const routes: RouteConfig[] = [
  {
    path: "/",
    name: "portal",
    component: Portal,
    meta: {
      title: "Home"
    }
  },
  {
    path: "/staking",
    name: "staking",
    component: Staking,
    meta: {
      title: "Staking Home"
    }
  },
  {
    path: "/wallets",
    name: "wallets",
    component: Wallets,
    meta: {
      title: "Wallets"
    }
  },
  {
    path: "/wallets/:address",
    name: "wallet-detail",
    component: WalletDetail,
    meta: {
      title: "Wallet Detail"
    }
  },
  {
    path: "/settings",
    name: "settings",
    component: Settings,
    meta: {
      title: "Settings"
    }
  },
  {
    path: "/candidates",
    name: "candidates",
    component: CandidateList,
    meta: { title: "Staking Candidates" }
  },
  {
    path: "/buckets",
    name: "buckets",
    component: BucketList,
    meta: { title: "Staking Bucket" }
  },
  {
    path: "/transfer",
    name: "transfer",
    component: Transfer,
    meta: {
      title: "Transfer"
    }
  },
  {
    path: "/staking/candidate",
    name: "candidate",
    component: StakingCandidate,
    meta: {
      title: "Staking Candidate"
    }
  },
  {
    path: "/staking/uncandidate",
    name: "uncandidate",
    component: StakingUncandidate,
    meta: {
      title: "Staking Uncandidate"
    }
  },
  {
    path: "/staking/bound",
    name: "bound",
    component: StakingBound,
    meta: {
      title: "Staking Bound"
    }
  },
  {
    path: "/staking/unbound/:id/:amount",
    name: "unbound",
    component: StakingUnbound,
    meta: {
      title: "Staking Unbound"
    }
  },
  {
    path: "/staking/delegate/:id/:amount",
    name: "delegate",
    component: StakingDelegate,
    meta: {
      title: "Staking Delegate"
    }
  },
  {
    path: "/staking/undelegate/:id/:amount",
    name: "undelegate",
    component: StakingUndelegate,
    meta: {
      title: "Staking Undelegate"
    }
  },
  {
    path: "/staking/vote/:candidateAddress",
    name: "vote",
    component: StakingVote,
    meta: {
      title: "Staking Vote"
    }
  },
  {
    path: "/staking/vote/create",
    name: "create-vote",
    component: StakingVote,
    meta: {
      title: "Staking Vote"
    }
  },
  {
    path: "/auction/bid",
    name: "auction-bid",
    component: AuctionBid,
    meta: {
      title: "Auction Bid"
    }
  },
  {
    path: "/auction/present",
    name: "auction-present",
    component: PresentAuction,
    meta: {
      title: "Present Auction"
    }
  },
  {
    path: "/auction/past",
    name: "past-auctions",
    component: PastAuctions,
    meta: {
      title: "Past Auctions"
    }
  },
  {
    path: "/bucket/:id",
    name: "bucket",
    component: Bucket,
    meta: {
      title: "Buckets"
    }
  },
  {
    path: "/staking/candidate/:addr/update",
    name: "update-candidate",
    component: StakingCandidateUpdate,
    meta: {
      title: "Edit Candidate"
    }
  },
  {
    path: "/slashing/bailout",
    name: "bailout-without-addr",
    component: SlashingBailOut,
    meta: {
      title: "Bail Out"
    }
  },
  {
    path: "/slashing/bailout/:addr",
    name: "bailout",
    component: SlashingBailOut,
    meta: {
      title: "Bail Out"
    }
  },
  {
    path: "/locked/transfer",
    name: "locked-transfer",
    component: LockedTransfer,
    meta: {
      title: "Locked Transfer"
    }
  }
];
</script>
<style>
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translate3d(60px, 0, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
}

@keyframes slide-out {
  to {
    opacity: 0;
    transform: translate3d(60px, 0, 0);
  }
}
@keyframes fade-out {
  to {
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}
.slide-in {
  animation-name: slide-in;
}
.slide-out {
  animation-name: slide-out;
}
.fade-in {
  animation-name: fade-in;
}
.fade-out {
  animation-name: fade-out;
}

.animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}
.animated.faster {
  animation-duration: 240ms;
}
</style>
