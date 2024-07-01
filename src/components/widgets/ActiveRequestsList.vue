<template>
  <div class="column no-wrap active-requests">
    <div
      v-if="activeRequestsList.length > 0"
      class="col-auto row active-requests-user-card text-md text-medium"
    >
      <div class="col row no-wrap items-center">
        <FarcasterUserChip class="col-auto" :custodyAddress="address" />
      </div>
    </div>
    <div class="col row active-requests-list base-scrollbar">
      <div
        v-if="activeRequestsList.length < 1"
        class="col-12 row active-requests-list-card-wrapper text-md text-medium"
      >
        <div
          class="col flex flex-center active-requests-list-card"
          style="height: 7rem"
        >
          No requests received yet...
          <div
            v-if="offerManagerStore.offersListLoading > 0"
            class="skeleton-loading"
          ></div>
        </div>
      </div>
      <div
        v-for="offer in activeRequestsList"
        :key="offer.offerId"
        class="col-12 row active-requests-list-card-wrapper"
      >
        <div class="col row active-requests-list-card">
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
            <!-- <div class="text-medium base-margin-right base-margin-right--mini">
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
          ></div> -->
            <div class="row justify-end items-center actions">
              <q-btn
                :disable="loading.get(offer.offerId as number)"
                class="base-button base-button--extra-mini base-button--outlined"
                @click="acceptOffer(offer)"
              >
                <div>Accept request</div>
                <q-tooltip anchor="center end" self="center start">
                  <div style="max-width: 12rem">
                    After accepting the offer, you must complete the
                    {{ offer.castType === 0 ? 'Recast' : 'Quote' }} within 24
                    hours, otherwise the offer can be canceled.
                  </div>
                </q-tooltip>
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
    <RequestCompletionForm ref="requestCompletionForm" />
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
import RequestCompletionForm from 'src/components/features/RequestCompletionForm.vue';

export default defineComponent({
  name: 'ActiveRequestsList',
  setup() {
    const { address, chainId, isConnected } = useWeb3ModalAccount();
    return { address, chainId, isConnected };
  },
  mixins: [commonHelpers],
  components: {
    FarcasterUserChip,
    InfoTooltip,
    RequestCompletionForm,
  },
  data() {
    return {
      loading: new Map<number, boolean>(),
      commisionCoefficient: 0.9999999 + commissionPercentage,
    };
  },
  methods: {
    async acceptOffer(offer: OfferInterface) {
      this.loading.set(offer.offerId as number, true);
      await this.handleMethodError(
        async () => {
          if (offer.offerState === 0) {
            await this.offerManagerStore.acceptOffer(offer.offerId as number);

            (
              this.$refs.requestCompletionForm as InstanceType<
                typeof RequestCompletionForm
              >
            )?.activate(offer);

            // Update the offers list
            await this.offerManagerStore.getOffersByAddress(true);
          }
        },
        undefined,
        undefined,
        () => {
          this.loading.set(offer.offerId as number, false);
        }
      );
    },
  },
  computed: {
    ...mapStores(useOfferManagerStore, useFarcasterStore),
    activeRequestsList() {
      return this.offerManagerStore.offersList.filter(
        (offer) => offer.receiver === this.address && offer.offerState === 0
      );
    },
  },
});
</script>

<style lang="scss">
.active-requests {
  .active-requests-list {
    overflow: auto;
    .active-requests-list-card-wrapper {
      &:not(:last-child) {
        margin-bottom: 1rem;
      }
      .active-requests-list-card {
        position: relative;
        border-radius: 0.5rem;
        border: 0.0625rem solid $secondary-hover;
        padding: 0.5rem 0.75rem;
      }
    }
  }

  .active-requests-user-card {
    position: relative;
    border-radius: 0.5rem;
    border: 0.0625rem solid $secondary-hover;
    padding: 0.5rem 0.75rem;
    margin-bottom: 1rem;
  }
}
</style>
