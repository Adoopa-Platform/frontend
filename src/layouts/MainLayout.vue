<template>
  <q-layout view="lHh Lpr lFf" class="column">
    <q-header class="col-auto row flex-center">
      <q-toolbar class="row no-wrap">
        <div class="col-auto row items-center logo-container">
          <router-link
            to="/"
            class="text-xl"
            style="color: white; text-decoration: none"
          >
            FarAd
          </router-link>
        </div>

        <div class="col row items-center toolbar-menu text-md">
          <router-link
            v-ripple
            class="row no-wrap items-center toolbar-menu-item"
            to="/offers"
          >
            <q-icon name="fa-solid fa-briefcase" style="font-size: 1rem" />
            <div v-if="$q.screen.gt.sm" style="margin-left: 0.5rem">Offers</div>
          </router-link>
          <router-link
            v-ripple
            class="row no-wrap items-center toolbar-menu-item"
            to="/requests"
          >
            <q-icon name="fa-solid fa-envelope" style="font-size: 1rem" />
            <div v-if="$q.screen.gt.sm" style="margin-left: 0.5rem">
              Requests
            </div>
          </router-link>
          <router-link
            v-ripple
            class="row no-wrap items-center toolbar-menu-item"
            to="/explore"
          >
            <q-icon name="fa-solid fa-users" style="font-size: 1rem" />
            <div v-if="$q.screen.gt.sm" style="margin-left: 0.5rem">
              Explore
            </div>
          </router-link>
          <a
            class="row no-wrap items-center toolbar-menu-item"
            href="https://basescan.org/address/0x5cC1e28e546906d09b0006d84755f8F216996004"
            target="_blank"
          >
            <q-icon name="fa-solid fa-file-contract" style="font-size: 1rem" />
            <div v-if="$q.screen.gt.sm" style="margin-left: 0.5rem">
              Contract
            </div>
          </a>
        </div>

        <div class="col-auto">
          <w3m-button />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container
      class="col column"
      v-if="address && chainId && checkIfChainIsSupported(chainId)"
    >
      <router-view />
    </q-page-container>
    <q-page-container v-else class="col column">
      <q-page class="col base-page column items-center">
        <div class="col row base-page-wrapper">
          <div class="col column flex-center text-xl">
            <img
              src="/img/farad_logo.png"
              class="base-margin-bottom"
              style="width: 10rem; height: 10rem; border-radius: 10rem"
            />
            <div v-if="!address">Connect a wallet to use the application</div>
            <div v-else>
              Connect to a supported chain to use the application
            </div>
            <div
              class="text-md text-medium text-center"
              style="max-width: 28rem; margin-top: 0.5rem"
            >
              FarAd is built for advertisers and bloggers in Farcaster. Our app
              allows you to promote casts safely and permissionless.
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useWeb3ModalAccount } from '@web3modal/ethers/vue';
import { availableChains } from 'src/boot/web3modal';

import { mapStores } from 'pinia';
import { useOfferManagerStore } from 'src/stores/offer-manager';
import { commonHelpers } from 'src/mixins';

export default defineComponent({
  name: 'MainLayout',
  mixins: [commonHelpers],
  setup() {
    const { address, chainId, isConnected } = useWeb3ModalAccount();
    return { address, chainId, isConnected };
  },
  data() {
    return {
      offersListAndBalanceUpdating: false,
    };
  },
  methods: {
    checkIfChainIsSupported(chainId: number) {
      return availableChains.some((chain) => chain.chainId === chainId);
    },
  },
  watch: {
    address: {
      async handler(newValue) {
        if (newValue && this.checkIfChainIsSupported(this.chainId as number)) {
          if (this.offersListAndBalanceUpdating) {
            return;
          }
          this.offersListAndBalanceUpdating = true;
          await Promise.all([
            this.handleMethodError(
              async () => {
                await this.offerManagerStore.getOffersByAddress(true);
              },
              undefined,
              () => {
                this.offerManagerStore.offersList = [];
              }
            ),
            await this.handleMethodError(
              async () => {
                await this.offerManagerStore.getEthBalance();
              },
              undefined,
              () => {
                this.offerManagerStore.ethBalance = 0;
              }
            ),
          ]);
          this.offersListAndBalanceUpdating = false;
        } else {
          this.offerManagerStore.offersList = [];
          this.offerManagerStore.ethBalance = 0;
        }
      },
      immediate: true,
    },
    chainId: {
      async handler(newValue) {
        if (newValue && this.checkIfChainIsSupported(newValue)) {
          if (this.offersListAndBalanceUpdating) {
            return;
          }
          this.offersListAndBalanceUpdating = true;
          await Promise.all([
            await this.handleMethodError(
              async () => {
                await this.offerManagerStore.getOffersByAddress(true);
              },
              undefined,
              () => {
                this.offerManagerStore.offersList = [];
              }
            ),
            await this.handleMethodError(
              async () => {
                await this.offerManagerStore.getEthBalance();
              },
              undefined,
              () => {
                this.offerManagerStore.ethBalance = 0;
              }
            ),
          ]);

          this.offersListAndBalanceUpdating = false;
        } else {
          this.offerManagerStore.offersList = [];
          this.offerManagerStore.ethBalance = 0;
        }
      },
      immediate: true,
    },
  },
  computed: {
    ...mapStores(useOfferManagerStore),
  },
});
</script>

<style lang="scss">
.q-layout {
  max-height: 100%;
  .q-header {
    height: 4rem;
    .q-toolbar {
      width: 100%;
      max-width: calc(79.6875rem + 3rem);
      height: 100%;
      max-height: 100%;
      padding: 0.5rem 1.5rem;

      .logo-container {
        padding-right: 1.75rem;
      }

      .toolbar-menu {
        height: 100%;
        border-left: 0.0625rem solid $secondary-hover;
        padding-left: 0.5rem;
        .toolbar-menu-item {
          position: relative;
          color: $text-medium;
          text-decoration: none;
          padding: 0.5rem 1rem;
          margin: 0 0.25rem;
          transition: background-color 0.3s, color 0.3s;
          border-radius: 1rem;

          &:hover {
            background-color: $secondary;
            color: $text;
          }

          &.router-link-active {
            background-color: $secondary-hover;
            color: $text;
          }
        }
      }
    }
    border-bottom: 0.0625rem solid $secondary-hover;
  }
}
</style>
