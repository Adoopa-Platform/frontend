<template>
  <div class="column no-wrap explore-list">
    <div
      v-if="receiversList.size < 1"
      class="col-12 flex flex-center text-md text-medium explore-list-no-items-card"
      style="height: 7rem"
    >
      No active users yet...
      <div
        v-if="loading > 0 && receiversList.size < 1"
        class="skeleton-loading"
      ></div>
    </div>
    <div
      v-if="receiversList.size > 0"
      class="col explore-list-table-wrapper base-scrollbar"
    >
      <table class="explore-list-table">
        <thead>
          <tr>
            <th><div class="row">User</div></th>
            <th>
              <div
                class="row no-wrap items-center cursor-pointer"
                @click="sortBy = 'offers'"
              >
                <div>Completed offers</div>
                <q-icon
                  v-if="sortBy === 'offers'"
                  name="fa-solid fa-arrow-down"
                  style="font-size: 0.75rem; margin-left: 0.5rem"
                />
              </div>
            </th>
            <th>
              <div
                class="row no-wrap items-center cursor-pointer"
                @click="sortBy = 'rewards'"
              >
                <div>Rewards</div>
                <q-icon
                  v-if="sortBy === 'rewards'"
                  name="fa-solid fa-arrow-down"
                  style="font-size: 0.75rem; margin-left: 0.5rem"
                />
              </div>
            </th>
            <th><div class="row">Score</div></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="[receiver, offers] in receiversList" :key="receiver">
            <td>
              <q-intersection once class="col-shrink">
                <FarcasterUserChip
                  class="col-shrink"
                  :custodyAddress="receiver"
                />
              </q-intersection>
            </td>
            <td>{{ offers.length }}</td>
            <td>
              <div class="row no-wrap items-center">
                <!-- <img
                src="/img/eth_logo.png"
                style="width: 1rem; height: 1rem; margin-right: 0.25rem"
              /> -->
                <div>
                  {{
                    (
                      offers.reduce(
                        (acc, offer) => acc + (offer.price ? offer.price : 0),
                        0
                      ) *
                      (2 - commisionCoefficient)
                    ).toFixed(7)
                  }}

                  ETH
                </div>
              </div>
            </td>
            <td>{{ calculateScoreForAddress(receiver).toFixed(0) }}</td>
            <td style="width: 1%">
              <router-link :to="`/offers?receiver=${receiver}`">
                <q-btn
                  class="base-button base-button--extra-mini base-button--outlined"
                >
                  <div>Make offer</div>
                </q-btn>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
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
// import InfoTooltip from 'src/components/shared/ui_elements/InfoTooltip.vue';

export default defineComponent({
  name: 'ExploreList',
  setup() {
    const { address, chainId, isConnected } = useWeb3ModalAccount();
    return { address, chainId, isConnected };
  },
  mixins: [commonHelpers],
  components: {
    FarcasterUserChip,
    // InfoTooltip,
  },
  data() {
    return {
      loading: 0,
      commisionCoefficient: 0.9999999 + commissionPercentage,
      sortBy: 'offers',
    };
  },
  async mounted() {
    try {
      this.loading++;
      await this.offerManagerStore.getAllOffers(true);
    } catch {
    } finally {
      this.loading--;
    }
  },
  methods: {
    calculateScoreForAddress(address: string) {
      return this.offerManagerStore.calculateScore(
        this.offerManagerStore.allOffersList.filter(
          (offer) =>
            offer.offerState == 3 &&
            (offer.receiver == address || offer.offerer == address)
        )
      );
    },
  },
  computed: {
    ...mapStores(useOfferManagerStore, useFarcasterStore),
    receiversList() {
      let receiversList = new Map() as Map<string, OfferInterface[]>;
      this.offerManagerStore.allOffersList.forEach((offer) => {
        if (offer.offerState !== 3) return;
        if (!receiversList.has(offer.receiver as string)) {
          receiversList.set(offer.receiver as string, [offer]);
        } else {
          receiversList.get(offer.receiver as string)?.push(offer);
        }
      });

      if (this.sortBy === 'offers') {
        receiversList = new Map(
          [...receiversList.entries()].sort((a, b) => {
            return b[1].length - a[1].length;
          })
        );
      } else if (this.sortBy === 'rewards') {
        receiversList = new Map(
          [...receiversList.entries()].sort((a, b) => {
            return (
              b[1].reduce(
                (acc, offer) => acc + (offer.price ? offer.price : 0),
                0
              ) -
              a[1].reduce(
                (acc, offer) => acc + (offer.price ? offer.price : 0),
                0
              )
            );
          })
        );
      }

      return receiversList;
    },
  },
});
</script>

<style lang="scss">
.explore-list {
  .explore-list-no-items-card {
    position: relative;
    border-radius: 0.5rem;
    border: 0.0625rem solid $secondary-hover;
    padding: 0.5rem 0.75rem;
  }

  .explore-list-table-wrapper {
    overflow: auto;
    .explore-list-table {
      min-width: 100%;
      font-size: 1rem;
      border-spacing: 0;
      background: $secondary;

      tr {
        position: relative;
        &::before {
          content: '';
          position: absolute;
          border-radius: 0.5rem;
          border: 0.0625rem solid $secondary-hover;
          top: 0;
          left: 0;
          right: 0;
          bottom: 1rem;
          pointer-events: none;
          z-index: 2;
        }

        th,
        td {
          padding: 0.5625rem 0.75rem 1.5625rem;
          text-align: left;
        }

        th {
          color: $text-medium;
          font-weight: 500;
        }
      }

      thead tr {
        position: sticky;
        top: 0;
        background: $secondary;
        z-index: 3; /* Ensure the header is above the table rows */
      }

      tbody tr {
        &:last-of-type {
          td {
            padding-bottom: 0.5625rem;
          }

          &::before {
            bottom: 0;
          }
        }
      }
    }
  }
}
</style>
