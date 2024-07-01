<template>
  <q-page class="col base-page column items-center">
    <div class="col row base-page-wrapper">
      <div class="col-12 column flex-center text-xl">
        <img
          src="/img/farad_logo.png"
          class="base-margin-bottom"
          style="width: 10rem; height: 10rem; border-radius: 10rem"
        />
        <div class="col-auto text-xl base-margin-bottom text-center">
          Welcome to FarAd - promoting platform for Farcaster!
        </div>
        <div
          class="base-margin-bottom text-center text-md text-medium"
          style="max-width: 40rem"
        >
          FarAd is built for advertisers and bloggers in Farcaster. Our app
          allows you to promote casts safely and permissionless.
        </div>
        <q-btn class="base-button base-button--mini" to="/offers">
          <div>Create first offer</div>
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'IndexPage',
});
</script>

<style lang="scss"></style>
