<template>
  <q-page class="col base-page column items-center">
    <div class="col column base-page-wrapper">
      <div class="col column base-cards-wrapper">
        <div
          class="col row base-cards-inner-wrapper base-cards-inner-wrapper--maxi content-start"
        >
          <div
            class="col-12 col-md-6 column base-card-wrapper"
            style="max-height: calc(100dvh - 5.5rem)"
          >
            <div class="col-auto column no-wrap base-card bordered-card">
              <div class="col-auto text-xl base-margin-bottom">
                Active requests
              </div>
              <ActiveRequestsList class="col" />
            </div>
          </div>
          <div
            class="col-12 col-md-6 column base-card-wrapper"
            style="max-height: calc(100dvh - 5.5rem)"
          >
            <div class="col-auto column no-wrap base-card bordered-card">
              <div class="col-auto text-xl base-margin-bottom">
                Accepted requests
              </div>
              <AcceptedRequestsList class="col" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ActiveRequestsList from 'src/components/widgets/ActiveRequestsList.vue';
import AcceptedRequestsList from 'src/components/widgets/AcceptedRequestsList.vue';

export default defineComponent({
  name: 'RequestsPage',
  components: {
    ActiveRequestsList,
    AcceptedRequestsList,
  },
});
</script>

<style lang="scss"></style>
