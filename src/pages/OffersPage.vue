<template>
  <q-page class="col base-page column items-center">
    <div class="col column base-page-wrapper">
      <div class="col column base-cards-wrapper">
        <div
          class="col row base-cards-inner-wrapper base-cards-inner-wrapper--maxi content-start"
        >
          <div class="col-12 col-md-6 column base-card-wrapper">
            <div class="col-auto column no-wrap base-card bordered-card">
              <div class="col-auto text-xl base-margin-bottom">
                Create offer
              </div>
              <CreateOfferForm />
            </div>
          </div>
          <div
            class="col-12 col-md-6 column base-card-wrapper"
            style="max-height: calc(100dvh - 5.5rem)"
          >
            <div class="col-auto column no-wrap base-card bordered-card">
              <div class="col-auto text-xl base-margin-bottom">Your offers</div>
              <OffersList class="col" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import CreateOfferForm from 'src/components/widgets/CreateOfferForm.vue';
import OffersList from 'src/components/widgets/OffersList.vue';

export default defineComponent({
  name: 'OffersPage',
  components: {
    CreateOfferForm,
    OffersList,
  },
});
</script>

<style lang="scss"></style>
