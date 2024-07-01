import { defineComponent } from 'vue';
const timeStamp = Date.now();
import { date } from 'quasar';

export default defineComponent({
  data() {
    return {
      periods: {
        lifetime: {
          title: 'Lifetime',
          value: {
            from: undefined,
            to: undefined,
          },
          default: true,
        },
        today: {
          title: 'Today',
          value: {
            from: date.formatDate(timeStamp, 'YYYY-MM-DD'),
            to: date.formatDate(
              date.addToDate(timeStamp, { days: 1 }),
              'YYYY-MM-DD'
            ),
          },
        },
        tomorrow: {
          title: 'Tomorrow',
          value: {
            from: date.formatDate(
              date.addToDate(timeStamp, { days: 1 }),
              'YYYY-MM-DD'
            ),
            to: date.formatDate(
              date.addToDate(timeStamp, { days: 2 }),
              'YYYY-MM-DD'
            ),
          },
        },
        nextThreeDays: {
          title: 'Next 3 days',
          value: {
            from: date.formatDate(timeStamp, 'YYYY-MM-DD'),
            to: date.formatDate(
              date.addToDate(timeStamp, { days: 3 }),
              'YYYY-MM-DD'
            ),
          },
          default: true,
        },
        nextSevenDays: {
          title: 'Next 7 days',
          value: {
            from: date.formatDate(timeStamp, 'YYYY-MM-DD'),
            to: date.formatDate(
              date.addToDate(timeStamp, { days: 7 }),
              'YYYY-MM-DD'
            ),
          },
          default: true,
        },
        sevenDays: {
          title: 'Last 7 days',
          value: {
            from: date.formatDate(
              date.subtractFromDate(timeStamp, { days: 7 }),
              'YYYY-MM-DD'
            ),
            to: date.formatDate(timeStamp, 'YYYY-MM-DD'),
          },
          default: true,
        },
        thirtyDays: {
          title: 'Last 30 days',
          value: {
            from: date.formatDate(
              date.subtractFromDate(timeStamp, { days: 30 }),
              'YYYY-MM-DD'
            ),
            to: date.formatDate(timeStamp, 'YYYY-MM-DD'),
          },
        },
        ninetyDays: {
          title: 'Last 90 days',
          value: {
            from: date.formatDate(
              date.subtractFromDate(timeStamp, { days: 90 }),
              'YYYY-MM-DD'
            ),
            to: date.formatDate(timeStamp, 'YYYY-MM-DD'),
          },
        },
      },
    };
  },
});
