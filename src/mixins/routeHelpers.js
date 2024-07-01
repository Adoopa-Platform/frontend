import { defineComponent } from 'vue';

export default defineComponent({
  // All this code is needed to handle multiple concurrent calls to setQueryParam
  beforeCreate() {
    this.$route.__setQueryPromise = null;
  },
  methods: {
    async setQueryParam(paramName, param) {
      if (!this.$route.__setQueryPromise) {
        // Create a new promise for the first call
        this.$route.__setQueryPromise = new Promise(async (resolve) => {
          await this.updateQuery(paramName, param);
          resolve();
        });
      } else {
        // For subsequent calls, wait for the existing promise
        this.$route.__setQueryPromise = this.$route.__setQueryPromise.then(
          async () =>
            await new Promise(async (resolve) => {
              await this.updateQuery(paramName, param);
              resolve();
            })
        );
      }
    },

    async updateQuery(paramName, param) {
      const updatedQuery = { ...this.$route.query, [paramName]: param };

      for (const key in updatedQuery) {
        if (updatedQuery[key] === null || updatedQuery[key] === undefined) {
          delete updatedQuery[key];
        }
      }

      await this.$router.replace({ query: updatedQuery });
    },
  },
});
