<template>
  <q-dialog
    v-model="showDialog"
    class="base-center-dialog"
    :persistent="!castUrlVisited"
  >
    <div
      class="column no-wrap base-card bordered-card request-completion-form hide-scrollbar"
    >
      <div
        v-if="castUrlVisited"
        class="flex flex-center base-card-close-button"
      >
        <q-icon name="fa-solid fa-times" @click="deactivate()" />
      </div>
      <div class="column no-wrap request-completion-form-content-wrapper">
        <div class="flex flex-center" style="padding: 2rem 0">
          <q-icon
            name="fa-regular fa-circle-check circle-check-icon"
            style="font-size: 5rem"
          />
        </div>
        <div class="text-xl flex flex-center text-center">
          Request accepted successfully!
        </div>
        <div
          class="text-md text-medium flex flex-center base-margin-bottom base-margin-bottom--extra"
          style="margin-top: 0.5rem"
        >
          <div class="text-center" style="max-width: 24rem">
            Make the
            {{ offerToComplete?.castType === 0 ? 'Recast' : 'Quote' }} within 24
            hours, otherwise the offer can be canceled.
          </div>
        </div>
        <div
          v-if="offerToComplete"
          class="col row request-completion-form-offer-card base-margin-bottom"
        >
          <div
            class="col-12 row no-wrap items-center"
            style="margin-bottom: 0.25rem"
          >
            <div
              class="col-auto text-md text-medium base-margin-right base-margin-right--mini"
            >
              Author:
            </div>
            <FarcasterUserChip
              class="col-shrink"
              :castURL="offerToComplete.castURL"
            />
          </div>
          <div class="col-7 row no-wrap items-center text-md">
            <div class="text-medium base-margin-right base-margin-right--mini">
              Type:
            </div>
            <div class="base-margin-right base-margin-right--mini">
              {{ getTextCastType(offerToComplete.castType as number) }}
            </div>
            <a
              :href="offerToComplete.castURL"
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
                secondsToDays(offerToComplete.duration as number) +
                (secondsToDays(offerToComplete.duration as number) > 1
                  ? ' days'
                  : ' day')
              }}
            </div>
            <InfoTooltip
              style="margin-left: 0.5rem"
              :text="`How long the ${
                offerToComplete.castType === 0 ? 'Recast' : 'Quote'
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
                  (
                    (offerToComplete.price as number) / commisionCoefficient
                  ).toFixed(7)
                )
              }}
            </div>
            <div>ETH</div>
          </div>
        </div>
        <div class="row no-wrap items-center actions">
          <q-btn
            class="col row no-wrap items-center base-button"
            @click="redirectToCast(offerToComplete as OfferInterface)"
          >
            <div>
              Make the {{ offerToComplete?.castType == 0 ? 'Recast' : 'Quote' }}
            </div>
            <q-icon
              name="fa-solid fa-arrow-right"
              style="font-size: 1rem; margin-left: 0.5rem"
            />
          </q-btn>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { commonHelpers } from 'src/mixins/';
import { OfferInterface, commissionPercentage } from 'src/stores/offer-manager';
import FarcasterUserChip from 'src/components/features/FarcasterUserChip.vue';
import InfoTooltip from 'src/components/shared/ui_elements/InfoTooltip.vue';

export default defineComponent({
  name: 'RequestCompletionForm',
  mixins: [commonHelpers],
  components: { FarcasterUserChip, InfoTooltip },
  data() {
    return {
      showDialog: false,
      offerToComplete: undefined as OfferInterface | undefined,
      commisionCoefficient: 0.9999999 + commissionPercentage,
      castUrlVisited: false,
    };
  },
  watch: {
    showDialog(val) {
      if (!val) {
        this.castUrlVisited = false;
      }
    },
  },
  methods: {
    redirectToCast(offer: OfferInterface) {
      if (offer.castType === 0) {
        window.open(offer.castURL, '_blank');
      } else {
        window.open(
          `https://warpcast.com/~/compose?&embeds[]=${offer.castURL}`,
          '_blank'
        );
      }
      this.castUrlVisited = true;
    },
    activate(offerToComplete: OfferInterface) {
      this.showDialog = true;
      this.offerToComplete = offerToComplete;
    },
    deactivate() {
      this.showDialog = false;
      this.offerToComplete = undefined;
    },
  },
});
</script>

<style lang="scss">
.base-center-dialog {
  padding: 1rem;
  .q-dialog__inner > div {
    border-radius: 1rem;
    max-width: unset;
  }
}

.request-completion-form {
  position: relative;
  max-width: 30rem !important;

  .request-completion-form-content-wrapper {
    .request-completion-form-offer-card {
      position: relative;
      border-radius: 0.5rem;
      border: 0.0625rem solid $secondary-hover;
      padding: 0.5rem 0.75rem;
    }

    .circle-check-icon {
      color: $positive;
    }
  }
}
</style>
