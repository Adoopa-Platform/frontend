<template>
  <q-select
    v-model="selectedOption"
    :options="options"
    :loading="loading > 0"
    :rules="rules"
    :placeholder="selectedOption ? undefined : 'Start typing to search...'"
    :label="label"
    :readonly="readonly"
    :hide-dropdown-icon="readonly"
    use-input
    clearable
    no-error-icon
    class="base-input farcaster-user-select"
    popup-content-class="base-input-select-popup farcaster-user-select-popup"
    @filter="filterFn"
  >
    <template v-slot:selected-item="scope">
      <div
        class="col-shrink row no-wrap items-center farcaster-user-select-selected-item"
      >
        <div class="col-auto flex flex-center user-pfp">
          <q-img spinner-size="0.75rem" :src="scope.opt.pfp_url" />
        </div>
        <div class="col ellipsis">
          {{ scope.opt.display_name }}
          <span class="username">
            {{ '@' + scope.opt.username + '' }}
          </span>
        </div>
      </div>
    </template>

    <template v-slot:option="scope">
      <q-item
        class="row no-wrap items-center farcaster-user-select-option"
        v-bind="scope.itemProps"
      >
        <div class="col-auto flex flex-center user-pfp">
          <q-img spinner-size="0.75rem" :src="scope.opt.pfp_url" />
        </div>
        <div class="col ellipsis">
          {{ scope.opt.display_name }}
          <span class="username">
            {{ '@' + scope.opt.username + '' }}
          </span>
        </div>
      </q-item>
    </template>

    <template v-slot:no-option>
      <q-item v-if="search && loading === 0" class="flex flex-center text-md">
        No users found
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import {
  useFarcasterStore,
  FarcasterUserInterface,
} from 'src/stores/farcaster';
import { mapStores } from 'pinia';
import { validationRules, commonHelpers } from 'src/mixins/';
import { ValidationRule } from 'quasar';

export default defineComponent({
  name: 'FarcasterUserSelect',
  mixins: [validationRules, commonHelpers],
  props: {
    selected: {
      type: String,
      default: undefined,
    },
    rules: {
      type: Array as PropType<ValidationRule[]>,
      default: () => [],
    },
    label: {
      type: String,
      default: undefined,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectedOption: undefined as FarcasterUserInterface | undefined,
      options: [] as FarcasterUserInterface[],
      loading: 0,
      search: '',
    };
  },
  watch: {
    selected: {
      async handler(val: string) {
        if (val && this.selectedOption?.custody_address !== val) {
          this.loading++;
          await this.handleMethodError(
            async () => {
              this.selectedOption =
                await this.farcasterStore.getFarcasterUserByCustodyAddress(val);
            },
            undefined,
            () => {
              this.selectedOption = undefined;
            }
          );
          this.loading--;
        } else if (!val) {
          this.selectedOption = undefined;
        }
      },
      immediate: true,
    },
    selectedOption: {
      handler() {
        this.$emit('update', this.selectedOption?.custody_address || undefined);
        this.$emit('update:object', this.selectedOption);
      },
      deep: true,
    },
  },
  methods: {
    async filterFn(
      val: string,
      update: (arg0: { (): Promise<void>; (): void }) => void
    ) {
      this.loading++;
      await this.handleMethodError(async () => {
        this.search = val;
        if (val === '') {
          const options = await this.farcasterStore.searchFarcasterUsers('a');
          update(async () => {
            this.options = options;
          });
        } else {
          const options = await this.farcasterStore.searchFarcasterUsers(
            val.toLowerCase()
          );
          update(async () => {
            this.options = options;
          });
        }
      });
      this.loading--;
    },
  },
  computed: {
    ...mapStores(useFarcasterStore),
  },
});
</script>

<style lang="scss">
.farcaster-user-select {
  .farcaster-user-select-selected-item {
    padding-right: 0.5rem;
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
}

.farcaster-user-select-popup {
  .farcaster-user-select-option {
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
      transition: color 0.3s;
    }

    &.q-manual-focusable--focused,
    &[aria-selected='true'] {
      .username {
        color: $text-medium;
      }
    }
  }
}
</style>
