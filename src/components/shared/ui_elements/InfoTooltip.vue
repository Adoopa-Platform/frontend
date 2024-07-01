<template>
  <q-icon name="fa-regular fa-circle-question" class="info-tooltip">
    <q-tooltip anchor="center end" self="center start">
      <div style="max-width: 12rem">{{ text }}</div>
    </q-tooltip>
  </q-icon>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'InfoTooltip',
  props: {
    text: {
      type: String,
      default: 'This is info text',
    },
  },
});
</script>

<style lang="scss">
.info-tooltip {
  font-size: 1em;
  cursor: help;
  color: $secondary-hover;
}
</style>
