<template>
  <div class="column no-wrap">
    <div
      v-if="acceptedRequestsList.length > 0"
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
    <div class="col row accepted-requests-list base-scrollbar">
      <div
        v-if="filteredAcceptedRequestsList.length < 1"
        class="col-12 row accepted-requests-list-card-wrapper text-md text-medium"
      >
        <div
          class="col flex flex-center accepted-requests-list-card"
          style="height: 7rem"
        >
          No requests accepted yet...
          <div
            v-if="offerManagerStore.offersListLoading > 0"
            class="skeleton-loading"
          ></div>
        </div>
      </div>
      <div
        v-for="offer in filteredAcceptedRequestsList"
        :key="offer.offerId"
        class="col-12 row accepted-requests-list-card-wrapper"
      >
        <div class="col row accepted-requests-list-card">
          <div
            class="col-12 row no-wrap items-center"
            style="margin-bottom: 0.25rem"
          >
            <div
              class="col-auto text-md text-medium base-margin-right base-margin-right--mini"
            >
              Author:
            </div>
            <q-intersection once class="col-shrink">
              <FarcasterUserChip class="col-shrink" :castURL="offer.castURL" />
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
            <InfoTooltip
              style="margin-left: 0.5rem"
              :text="`How long the ${
                offer.castType === 0 ? 'Recast' : 'Quote'
              } must stay posted to complete the offer.`"
            />
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
            <div
              v-if="
                getRequestStatus(offer) === 'in_work' ||
                getRequestStatus(offer) === 'canceled' ||
                getRequestStatus(offer) === 'completed'
              "
              class="row no-wrap items-center"
            >
              <div
                class="text-medium base-margin-right base-margin-right--mini"
              >
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
            </div>
            <div class="row justify-end items-center actions">
              <!-- <q-btn
                v-if="getRequestStatus(offer) === 'in_work'"
                :disable="loading.get(offer.offerId as number)"
                class="base-button base-button--extra-mini base-button--outlined"
                :href="offer.castURL"
                target="_blank"
              >
                <div>Complete request</div>
              </q-btn> -->
              <q-btn
                v-if="getRequestStatus(offer) === 'ready_to_claim'"
                :disable="loading.get(offer.offerId as number)"
                class="base-button base-button--extra-mini base-button--outlined"
                @click="verifyAndClaim(offer)"
              >
                <div>Verify & Claim</div>
              </q-btn>
              <div
                class="base-padding-left base-padding-left--mini"
                style="cursor: help"
              >
                <q-circular-progress
                  v-if="loading.get(offer.offerId as number)"
                  indeterminate
                  rounded
                  size="1.34rem"
                  :thickness="0.3"
                  track-color="#FFFFFF00"
                  class="base-circular-progress"
                />
                <q-tooltip anchor="center end" self="center start">
                  <div style="max-width: 12rem">Transaction in progress</div>
                </q-tooltip>
              </div>
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
import InfoTooltip from 'src/components/shared/ui_elements/InfoTooltip.vue';

export default defineComponent({
  name: 'AcceptedRequestsList',
  setup() {
    const { address, chainId, isConnected } = useWeb3ModalAccount();
    return { address, chainId, isConnected };
  },
  mixins: [commonHelpers],
  components: {
    FarcasterUserChip,
    InfoTooltip,
  },
  data() {
    return {
      loading: new Map<number, boolean>(),
      commisionCoefficient: 0.9999999 + commissionPercentage,
      filterOptions: [
        { label: 'In work', value: 'in_work' },
        { label: 'Ready to claim', value: 'ready_to_claim' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Completed', value: 'completed' },
        { label: 'All', value: 'all' },
      ],
      filterBy: 'all',
    };
  },
  methods: {
    async verifyAndClaim(offer: OfferInterface) {
      this.loading.set(offer.offerId as number, true);
      await this.handleMethodError(
        async () => {
          let response = await this.offerManagerStore.getVereficationResult(
            offer.offerId as number
          );

          if (response.result) {
            await this.offerManagerStore.completeOffer(
              offer.offerId as number,
              response.v,
              response.r,
              response.s
            );

            // Notify the user
            this.$q.notify({
              message:
                'Offer successfully completed! Reward will arrive to your wallet soon.',
              position: this.$q.screen.gt.xs ? 'top-right' : 'top',
              classes: 'max-width-24rem',
            });

            // Update the offers list
            await this.offerManagerStore.getOffersByAddress(true);
          } else {
            this.$q.notify({
              message: 'Offer is not completed!',
              position: this.$q.screen.gt.xs ? 'top-right' : 'top',
              classes: 'max-width-24rem notify-error',
            });
          }
        },
        undefined,
        undefined,
        () => {
          this.loading.set(offer.offerId as number, false);
        }
      );
    },
    getRequestStatus(offer: OfferInterface) {
      if (
        offer.offerState === 1 &&
        this.offerManagerStore.lastUpdateTimestamp -
          Number(offer.acceptTimestamp) <
          Number(offer.duration)
      ) {
        return 'in_work';
      }
      if (
        offer.offerState === 1 &&
        this.offerManagerStore.lastUpdateTimestamp -
          Number(offer.acceptTimestamp) >=
          Number(offer.duration)
      ) {
        return 'ready_to_claim';
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
    acceptedRequestsList() {
      return this.offerManagerStore.offersList.filter(
        (offer) =>
          offer.receiver === this.address &&
          offer.acceptTimestamp &&
          offer.acceptTimestamp > 0
      );
    },
    filteredAcceptedRequestsList() {
      return this.acceptedRequestsList
        .filter((offer) => {
          if (this.filterBy === 'all') {
            return true;
          }
          if (this.filterBy === 'in_work') {
            return (
              offer.offerState === 1 &&
              this.offerManagerStore.lastUpdateTimestamp -
                Number(offer.acceptTimestamp) <
                Number(offer.duration)
            );
          }
          if (this.filterBy === 'ready_to_claim') {
            return (
              offer.offerState === 1 &&
              this.offerManagerStore.lastUpdateTimestamp -
                Number(offer.acceptTimestamp) >=
                Number(offer.duration)
            );
          }
          if (this.filterBy === 'canceled') {
            return offer.offerState === 2;
          }
          if (this.filterBy === 'completed') {
            return offer.offerState === 3;
          }
          return true;
        })
        .sort((a, b) => Number(b.acceptTimestamp) - Number(a.acceptTimestamp));
    },
  },
});
</script>

<style lang="scss">
.accepted-requests-list {
  overflow: auto;
  .accepted-requests-list-card-wrapper {
    &:not(:last-child) {
      margin-bottom: 1rem;
    }
    .accepted-requests-list-card {
      position: relative;
      border-radius: 0.5rem;
      border: 0.0625rem solid $secondary-hover;
      padding: 0.5rem 0.75rem;
    }
  }
}
</style>
