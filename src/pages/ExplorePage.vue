<template>
  <q-page class="col base-page column items-center">
    <div class="col column base-page-wrapper">
      <div class="col column base-cards-wrapper" style="max-width: 100%">
        <div
          class="col row base-cards-inner-wrapper base-cards-inner-wrapper--maxi content-start"
        >
          <div
            class="col-12 column base-card-wrapper"
            style="max-height: calc(100dvh - 5.5rem)"
          >
            <div class="col-auto column no-wrap base-card bordered-card">
              <div class="col-auto text-xl base-margin-bottom">Explore</div>
              <ExploreList class="col" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ExploreList from 'src/components/widgets/ExploreList.vue';

export default defineComponent({
  name: 'ExplorePage',
  components: {
    ExploreList,
  },
});
</script>

<style lang="scss"></style>
