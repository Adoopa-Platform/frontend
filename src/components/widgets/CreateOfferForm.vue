<template>
  <q-form
    ref="createOfferForm"
    class="column no-wrap create-offer-form"
    @submit="createOffer"
  >
    <div class="column no-wrap">
      <div class="column no-wrap base-margin-bottom">
        <div
          class="row no-wrap items-center text-lg text-medium base-margin-bottom base-margin-bottom--mini"
        >
          <div>User you're sending the offer to</div>
          <InfoTooltip
            style="margin-left: 0.5rem"
            text="Farcaster user who will receive and complete the offer."
          />
        </div>
        <FarcasterUserSelect
          :selected="editedOffer.receiver"
          :rules="[validationRules.required]"
          :disable="loading > 0"
          @update="editedOffer.receiver = $event"
        />
      </div>

      <div class="column no-wrap base-margin-bottom">
        <div
          class="row no-wrap items-center text-lg text-medium base-margin-bottom base-margin-bottom--mini"
        >
          <div>Link to your cast</div>
          <InfoTooltip
            style="margin-left: 0.5rem"
            text="URL of the Farcaster cast that the user must interact with to complete the offer."
          />
        </div>
        <q-input
          v-model="editedOffer.castURL"
          placeholder="Cast URL"
          :rules="[validationRules.required, validateCastUrl]"
          :disable="loading > 0"
          clearable
          no-error-icon
          class="base-input"
        />
      </div>

      <div class="row base-margin-bottom">
        <div class="col-12 col-sm-6 column no-wrap">
          <div
            class="row no-wrap items-center text-lg text-medium base-margin-bottom base-margin-bottom--mini"
          >
            <div>Offer type</div>
            <InfoTooltip
              style="margin-left: 0.5rem"
              text="Type of interaction the user must perform to complete the offer."
            />
          </div>
          <q-btn-toggle
            v-model="editedOffer.castType"
            :disable="loading > 0"
            :options="[
              { label: 'Recast', value: 0 },
              { label: 'Quote', value: 1 },
            ]"
            class="base-button-toggle base-button-toggle--mini"
          />
        </div>
        <div class="col-12 col-sm-6 column no-wrap">
          <div
            class="row no-wrap items-center justify-end text-lg text-medium base-margin-bottom base-margin-bottom--mini"
          >
            <div>Duration</div>
            <InfoTooltip
              style="margin-left: 0.5rem"
              text="How long the Recast or Quote must stay posted to complete the offer."
            />
          </div>
          <div class="row justify-end">
            <q-btn-dropdown
              :label="
                durationOptions.find(
                  (option) => option.value === editedOffer.duration
                )?.label || 'Select duration'
              "
              :disable="loading > 0"
              style="min-width: 6.625rem"
              class="base-button base-button--mini base-button--outlined"
              content-class="base-button-dropdown-menu base-button-dropdown-menu--mini"
            >
              <q-list>
                <q-item
                  v-for="durationOption in durationOptions"
                  :key="durationOption.value"
                  class="row items-center"
                  clickable
                  v-close-popup
                  @click="editedOffer.duration = durationOption.value"
                >
                  {{ durationOption.label }}
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
      </div>

      <div class="column no-wrap">
        <div
          class="row no-wrap items-center text-lg text-medium base-margin-bottom base-margin-bottom--mini"
        >
          <div>Reward amount</div>
          <InfoTooltip
            style="margin-left: 0.5rem"
            text="Reward for completing the offer. You will be charged an additional 1% to cover the service fee."
          />
        </div>
        <q-input
          :model-value="editedOffer.price"
          placeholder="Reward"
          :rules="[
            validationRules.required,
            validationRules.minOfferReward,
            checkIfEnoughEth,
          ]"
          :disable="loading > 0"
          type="number"
          step="0.00001"
          clearable
          no-error-icon
          class="base-input"
          @update:modelValue="
            $event && String($event).length > 7
              ? (editedOffer.price = Number(String($event).slice(0, 7)))
              : (editedOffer.price = $event ? Number($event) : undefined)
          "
          @focus="offerManagerStore.getEthBalance()"
        >
          <template v-slot:append>
            <div class="row no-wrap items-center">
              <img
                src="/img/eth_logo.png"
                style="width: 1.5rem; height: 1.5rem"
                class="base-margin-right base-margin-right--mini"
              />
              <div>ETH</div>
            </div>
          </template>
        </q-input>
        <div
          class="row justify-end text-sm text-medium"
          style="
            padding: 0.125rem 0.875rem 0 0;
            font-size: 0.75rem;
            cursor: default;
          "
        >
          <div style="z-index: 2">
            Balance:
            <span class="cursor-pointer" @click="setMaximumAvailableReward()">
              {{ offerManagerStore.ethBalance.toFixed(5) }} ETH</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="row dashed-line" style="margin: 1.25rem 0 1.25rem"></div>
    <div class="row justify-between items-center actions">
      <div class="text-md text-medium">
        You will pay:
        {{
          editedOffer.price
            ? parseFloat((editedOffer.price * commisionCoefficient).toFixed(7))
            : 0
        }}
        ETH
      </div>
      <div class="row no-wrap items-center">
        <div style="cursor: help">
          <q-circular-progress
            v-if="loading > 0"
            indeterminate
            rounded
            size="2rem"
            :thickness="0.3"
            track-color="#FFFFFF00"
            class="base-circular-progress base-margin-right base-margin-right--small"
          />
          <q-tooltip anchor="center start" self="center end">
            <div style="max-width: 12rem">Transaction in progress</div>
          </q-tooltip>
        </div>
        <q-btn
          :disable="loading > 0"
          class="base-button base-button--mini"
          type="submit"
        >
          <div>Create offer</div>
        </q-btn>
      </div>
    </div>
  </q-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  useOfferManagerStore,
  OfferInterface,
  commissionPercentage,
} from 'src/stores/offer-manager';
import { useFarcasterStore } from 'src/stores/farcaster';
import { mapStores } from 'pinia';
import { commonHelpers, routeHelpers, validationRules } from 'src/mixins/';
import { QForm } from 'quasar';

import FarcasterUserSelect from 'src/components/features/FarcasterUserSelect.vue';
import InfoTooltip from 'src/components/shared/ui_elements/InfoTooltip.vue';

export default defineComponent({
  name: 'CreateOfferForm',
  mixins: [commonHelpers, validationRules, routeHelpers],
  components: {
    FarcasterUserSelect,
    InfoTooltip,
  },
  data() {
    return {
      loading: 0,
      editedOffer: {
        castType: 0,
        duration: 259200,
      } as OfferInterface,
      durationOptions: [
        { label: '5 min', value: 300 },
        { label: '1 day', value: 86400 },
        { label: '3 days', value: 259200 },
        { label: '7 days', value: 604800 },
        { label: '14 days', value: 1209600 },
        { label: '30 days', value: 2592000 },
      ],
      commisionCoefficient: commissionPercentage + 1,
    };
  },
  methods: {
    async createOffer() {
      this.loading++;
      await this.handleMethodError(
        async () => {
          // Check if the user is connected to the correct network
          await this.offerManagerStore.checkAndChangeNetwork();

          // Create the offer
          await this.offerManagerStore.createOffer(
            this.editedOffer.receiver as string,
            parseFloat(
              (
                (this.editedOffer.price as number) * this.commisionCoefficient
              ).toFixed(7)
            ),
            '0x0000000000000000000000000000000000000000',
            this.editedOffer.duration as number,
            this.editedOffer.castURL as string,
            this.editedOffer.castType as number
          );

          // Reset the form
          this.editedOffer = {
            castType: 0,
            duration: 259200,
          } as OfferInterface;
          (this.$refs.createOfferForm as InstanceType<typeof QForm>)?.reset();

          // Update the offers list
          await this.offerManagerStore.getOffersByAddress(true);

          // Notify the user
          this.$q.notify({
            message: 'Offer created successfully!',
            position: this.$q.screen.gt.xs ? 'top-right' : 'top',
            classes: 'max-width-24rem',
          });
        },
        undefined,
        undefined,
        () => {
          this.loading--;
        }
      );
    },
    async validateCastUrl(url: string) {
      const errorMessage = 'Invalid cast URL';

      // Check if the URL is a valid WarpCast URL
      if (
        !/^https:\/\/warpcast\.com\/[a-zA-Z0-9_.-]+\/0x[a-fA-F0-9]{8}$/.test(
          url
        )
      ) {
        return errorMessage;
      }

      // Check if the cast exists
      try {
        await this.farcasterStore.getFarcasterCastByURL(url);
      } catch (error) {
        return errorMessage;
      }

      return true;
    },
    async checkIfEnoughEth(value: number) {
      const ethBalance = await this.offerManagerStore.getEthBalance();
      const estimatedFee = await this.offerManagerStore.estimateGas(
        'createOffer'
      );
      return (
        value * this.commisionCoefficient <=
          Number(ethBalance) - estimatedFee ||
        !value ||
        'Not enough ETH'
      );
    },
    async setMaximumAvailableReward() {
      await this.offerManagerStore.getEthBalance();
      const estimatedFee = await this.offerManagerStore.estimateGas(
        'createOffer'
      );
      this.editedOffer.price = Math.max(
        0,
        Number(
          (
            this.offerManagerStore.ethBalance / this.commisionCoefficient -
            estimatedFee -
            0.00001
          ).toFixed(5)
        )
      );
    },
  },
  async mounted() {
    await this.offerManagerStore.getEthBalance();

    if (this.$route.query.receiver) {
      this.editedOffer.receiver = this.$route.query.receiver as string;
      this.setQueryParam('receiver', undefined);
    }
  },
  computed: {
    ...mapStores(useOfferManagerStore, useFarcasterStore),
  },
});
</script>

<style lang="scss">
.create-offer-form {
  max-width: 100%;
}
</style>
