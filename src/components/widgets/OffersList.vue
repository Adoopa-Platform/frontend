<template>
  <div class="column no-wrap">
    <div
      v-if="userOffersList.length > 0"
      class="col-auto row items-center base-margin-bottom base-margin-bottom--small group-selector"
      style="min-height: 2.625rem"
    >
      <div class="row group-selector-wrapper">
        <template v-for="(status, index) in filterOptions" :key="index">
          <q-btn
            class="selector-button"
            :class="{
              active: filterBy === status.value,
            }"
            @click="filterBy = status.value"
          >
            {{ status.label }}
          </q-btn>
        </template>
      </div>
    </div>
    <div class="col row offers-list base-scrollbar">
      <div
        v-if="filteredUserOffersList.length < 1"
        class="col-12 row offers-list-card-wrapper text-md text-medium"
      >
        <div class="col flex flex-center offers-list-card" style="height: 7rem">
          No offers created yet...
          <div
            v-if="offerManagerStore.offersListLoading > 0"
            class="skeleton-loading"
          ></div>
        </div>
      </div>
      <div
        v-for="offer in filteredUserOffersList"
        :key="offer.offerId"
        class="col-12 row offers-list-card-wrapper"
      >
        <div class="col row offers-list-card">
          <div
            class="col-12 row no-wrap items-center"
            style="margin-bottom: 0.25rem"
          >
            <div
              class="col-auto text-md text-medium base-margin-right base-margin-right--mini"
            >
              To:
            </div>
            <q-intersection once class="col-shrink">
              <FarcasterUserChip
                class="col-shrink"
                :custodyAddress="offer.receiver"
              />
            </q-intersection>
          </div>
          <div class="col-7 row no-wrap items-center text-md">
            <div class="text-medium base-margin-right base-margin-right--mini">
              Type:
            </div>
            <div class="base-margin-right base-margin-right--mini">
              {{ getTextCastType(offer.castType as number) }}
            </div>
            <a
              :href="offer.castURL"
              target="_blank"
              class="text-medium"
              style="text-decoration: unset"
            >
              (View cast)
            </a>
          </div>
          <div class="col-5 row no-wrap items-center text-md">
            <div class="text-medium base-margin-right base-margin-right--mini">
              Duration:
            </div>
            <div>
              {{
                secondsToDays(offer.duration as number) +
                (secondsToDays(offer.duration as number) > 1 ? ' days' : ' day')
              }}
            </div>
          </div>
          <div class="col-12 dashed-line" style="margin: 0.5rem 0"></div>
          <div class="col-7 row no-wrap items-center text-md">
            <div class="text-medium base-margin-right base-margin-right--mini">
              Reward:
            </div>
            <img
              src="/img/eth_logo.png"
              style="width: 1rem; height: 1rem; margin-right: 0.25rem"
              class="base-margin-right base-margin-right--mini"
            />
            <div style="margin-right: 0.25rem">
              {{
                parseFloat(
                  ((offer.price as number) / commisionCoefficient).toFixed(7)
                )
              }}
            </div>
            <div>ETH</div>
          </div>
          <div class="col-5 row no-wrap items-center text-md">
            <div class="text-medium base-margin-right base-margin-right--mini">
              Status:
            </div>
            <div class="base-margin-right base-margin-right--mini">
              {{ getTextOfferState(offer.offerState as number) }}
            </div>
            <div
              class="offer-status-indicator"
              :class="{
                'indicator--active': offer.offerState === 0,
                'indicator--in-work': offer.offerState === 1,
                'indicator--canceled': offer.offerState === 2,
                'indicator--completed': offer.offerState === 3,
              }"
            ></div>
            <q-icon
              v-if="
                getOfferStatus(offer) === 'active' ||
                getOfferStatus(offer) === 'stuck'
              "
              name="fa-solid fa-ban"
              class="cancel-offer-btn"
              :class="{ disabled: loading.get(offer.offerId as number) }"
              @click="
                loading.get(offer.offerId as number)
                  ? undefined
                  : cancelOffer(offer)
              "
            >
              <q-tooltip anchor="center end" self="center start">
                <div style="max-width: 12rem">
                  Cancel offer. The reward will be returned to you.
                </div>
              </q-tooltip>
            </q-icon>

            <div style="cursor: help">
              <q-circular-progress
                v-if="loading.get(offer.offerId as number)"
                indeterminate
                rounded
                size="1rem"
                :thickness="0.3"
                track-color="#FFFFFF00"
                class="base-circular-progress"
                style="margin-left: 0.5rem"
              />
              <q-tooltip anchor="center start" self="center end">
                <div style="max-width: 12rem">Transaction in progress</div>
              </q-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import {
  useOfferManagerStore,
  commissionPercentage,
  OfferInterface,
} from 'src/stores/offer-manager';
import { useFarcasterStore } from 'src/stores/farcaster';
import { mapStores } from 'pinia';
import { commonHelpers } from 'src/mixins';
import { useWeb3ModalAccount } from '@web3modal/ethers/vue';

import FarcasterUserChip from 'src/components/features/FarcasterUserChip.vue';

export default defineComponent({
  name: 'OffersList',
  setup() {
    const { address, chainId, isConnected } = useWeb3ModalAccount();
    return { address, chainId, isConnected };
  },
  mixins: [commonHelpers],
  components: {
    FarcasterUserChip,
  },
  data() {
    return {
      loading: new Map<number, boolean>(),
      commisionCoefficient: 0.9999999 + commissionPercentage,
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'In work', value: 'in_work' },
        { label: 'Stuck', value: 'stuck' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Completed', value: 'completed' },
        { label: 'All', value: 'all' },
      ],
      filterBy: 'all',
    };
  },
  methods: {
    async cancelOffer(offer: OfferInterface) {
      this.loading.set(offer.offerId as number, true);
      await this.handleMethodError(
        async () => {
          if (this.getOfferStatus(offer) === 'active') {
            await this.offerManagerStore.cancelOffer(
              offer.offerId as number,
              27,
              '0x7e5d3d7c0c955b9840c5a3a5f7504b2fd8f2ac41e0c5052fb3b8d689b53b3490',
              '0x67fd2200a9f28c7b49ee6d04b1d67b0109b8cb4a2b9d99b24082f3058f252bd1'
            );

            // Notify the user
            this.$q.notify({
              message: 'Offer canceled successfully!',
              position: this.$q.screen.gt.xs ? 'top-right' : 'top',
              classes: 'max-width-24rem',
            });

            // Update the offers list
            await this.offerManagerStore.getOffersByAddress(true);
          }
          if (this.getOfferStatus(offer) === 'stuck') {
            let response = await this.offerManagerStore.getVereficationResult(
              offer.offerId as number
            );

            if (response.result === false) {
              await this.offerManagerStore.cancelOffer(
                offer.offerId as number,
                response.v,
                response.r,
                response.s
              );

              // Notify the user
              this.$q.notify({
                message: 'Offer canceled successfully!',
                position: this.$q.screen.gt.xs ? 'top-right' : 'top',
                classes: 'max-width-24rem',
              });

              // Update the offers list
              await this.offerManagerStore.getOffersByAddress(true);
            } else {
              this.$q.notify({
                message: 'Offer is completed, you can not cancel it!',
                position: this.$q.screen.gt.xs ? 'top-right' : 'top',
                classes: 'max-width-24rem notify-error',
              });
            }
          }
        },
        undefined,
        undefined,
        () => {
          this.loading.set(offer.offerId as number, false);
        }
      );
    },
    getOfferStatus(offer: OfferInterface) {
      if (offer.offerState === 0) {
        return 'active';
      }
      if (
        offer.offerState === 1 &&
        this.offerManagerStore.lastUpdateTimestamp -
          Number(offer.acceptTimestamp) <
          Number(offer.duration) + 86400
      ) {
        return 'in_work';
      }
      if (
        offer.offerState === 1 &&
        this.offerManagerStore.lastUpdateTimestamp -
          Number(offer.acceptTimestamp) >=
          Number(offer.duration) + 86400
      ) {
        return 'stuck';
      }
      if (offer.offerState === 2) {
        return 'canceled';
      }
      if (offer.offerState === 3) {
        return 'completed';
      }
      return 'all';
    },
  },
  computed: {
    ...mapStores(useOfferManagerStore, useFarcasterStore),
    userOffersList() {
      return this.offerManagerStore.offersList.filter(
        (offer) => offer.offerer === this.address
      );
    },
    filteredUserOffersList() {
      return this.userOffersList.filter((offer) => {
        if (this.filterBy === 'all') {
          return true;
        }
        if (this.filterBy === 'active') {
          return offer.offerState === 0;
        }
        if (this.filterBy === 'in_work') {
          return (
            offer.offerState === 1 &&
            this.offerManagerStore.lastUpdateTimestamp -
              Number(offer.acceptTimestamp) <
              Number(offer.duration) + 86400
          );
        }
        if (this.filterBy === 'stuck') {
          return (
            offer.offerState === 1 &&
            this.offerManagerStore.lastUpdateTimestamp -
              Number(offer.acceptTimestamp) >=
              Number(offer.duration) + 86400
          );
        }
        if (this.filterBy === 'canceled') {
          return offer.offerState === 2;
        }
        if (this.filterBy === 'completed') {
          return offer.offerState === 3;
        }
        return true;
      });
    },
  },
});
</script>

<style lang="scss">
.offers-list {
  overflow: auto;
  .offers-list-card-wrapper {
    &:not(:last-child) {
      margin-bottom: 1rem;
    }
    .offers-list-card {
      position: relative;
      border-radius: 0.5rem;
      border: 0.0625rem solid $secondary-hover;
      padding: 0.5rem 0.75rem;

      .cancel-offer-btn {
        font-size: 1rem;
        margin-left: 0.5rem;
        cursor: pointer;
        color: $secondary-hover;
        transition: color 0.3s;

        &:not(.disabled):hover {
          color: $negative;
        }
      }
    }
  }
}
</style>
