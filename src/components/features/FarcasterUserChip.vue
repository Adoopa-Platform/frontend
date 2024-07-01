<template>
  <a
    class="row no-wrap items-center farcaster-user-chip"
    :href="
      farcasterUser
        ? `https://warpcast.com/${farcasterUser.username}`
        : undefined
    "
    target="_blank"
  >
    <template v-if="farcasterUser">
      <div class="col-auto flex flex-center user-pfp">
        <q-img spinner-size="0.75rem" :src="farcasterUser.pfp_url" />
      </div>
      <div class="col row no-wrap items-center ellipsis">
        <div style="margin-right: 0.25rem">
          {{ farcasterUser.display_name }}
        </div>
        <img
          v-if="farcasterUser.power_badge"
          src="/img/power_badge.webp"
          style="width: 0.75rem; height: 0.75rem; margin-right: 0.25rem"
        />
        <div class="username">
          {{ '@' + farcasterUser.username + '' }}
        </div>
      </div>
    </template>
    <template v-else>
      <div class="col ellipsis">No user found by credentials</div>
    </template>
    <div v-if="loading > 0" class="skeleton-loading"></div>
  </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  useFarcasterStore,
  FarcasterUserInterface,
} from 'src/stores/farcaster';
import { mapStores } from 'pinia';
import { commonHelpers } from 'src/mixins/';

export default defineComponent({
  name: 'FarcasterUserChip',
  mixins: [commonHelpers],
  props: {
    custodyAddress: {
      type: String,
      default: undefined,
    },
    castURL: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      farcasterUser: undefined as FarcasterUserInterface | undefined,
      loading: 0,
    };
  },
  watch: {
    custodyAddress: {
      async handler(val: string) {
        if (val && this.farcasterUser?.custody_address !== val) {
          this.loading++;
          try {
            this.farcasterUser =
              await this.farcasterStore.getFarcasterUserByCustodyAddress(val);
          } catch (error) {
            this.farcasterUser = undefined;
          }
          this.loading--;
        } else if (!val) {
          this.farcasterUser = undefined;
        }
      },
      immediate: true,
    },
    castURL: {
      async handler(val: string) {
        if (val) {
          this.loading++;
          try {
            let cast = await this.farcasterStore.getFarcasterCastByURL(val);
            this.farcasterUser = cast.author as FarcasterUserInterface;
          } catch (error) {
            this.farcasterUser = undefined;
          }
          this.loading--;
        } else if (!val) {
          this.farcasterUser = undefined;
        }
      },
      immediate: true,
    },
  },
  computed: {
    ...mapStores(useFarcasterStore),
  },
});
</script>

<style lang="scss">
.farcaster-user-chip {
  position: relative;
  width: fit-content;
  max-width: 100%;
  min-height: 1.375rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  text-decoration: unset;
  color: $text;

  .user-pfp {
    padding-right: 0.375rem;
    .q-img {
      width: 1.375rem;
      height: 1.375rem;
      border-radius: 0.375rem;
      border: 0.0625rem solid $accent-disabled;
    }
  }

  .username {
    color: $accent-disabled;
  }
}
</style>
