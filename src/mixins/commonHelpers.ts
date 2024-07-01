import { defineComponent } from 'vue';
import { copyToClipboard, date, format, is, scroll } from 'quasar';
const { getScrollTarget, setVerticalScrollPosition } = scroll;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseError(error: any): string | null {
  if (error.code && error.message) {
    switch (error.code) {
      // Generic Errors
      case 'UNKNOWN_ERROR':
        return 'An unknown error occurred!';
      case 'NOT_IMPLEMENTED':
        return 'This feature is not implemented!';
      case 'UNSUPPORTED_OPERATION':
        return 'This operation is not supported!';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection!';
      case 'SERVER_ERROR':
        return `Server error: ${error.message}`;
      case 'TIMEOUT':
        return 'Request timed out. Please try again!';
      case 'BAD_DATA':
        return 'Received bad data!';
      case 'CANCELLED':
        return 'The operation was cancelled!';

      // Operational Errors
      case 'BUFFER_OVERRUN':
        return 'Buffer overrun error!';
      case 'NUMERIC_FAULT':
        return 'Numeric fault error!';

      // Argument Errors
      case 'INVALID_ARGUMENT':
        return `Invalid argument: ${error.message}`;
      case 'MISSING_ARGUMENT':
        return 'Missing argument error!';
      case 'UNEXPECTED_ARGUMENT':
        return 'Unexpected argument error!';
      case 'VALUE_MISMATCH':
        return 'Value mismatch error!';

      // Blockchain Errors
      case 'CALL_EXCEPTION':
        return `Call exception: ${error.reason || error.message}`;
      case 'INSUFFICIENT_FUNDS':
        return 'Insufficient funds for the transaction!';
      case 'NONCE_EXPIRED':
        return 'Nonce expired. Please try again!';
      case 'REPLACEMENT_UNDERPRICED':
        return 'Replacement transaction underpriced. Increase gas price!';
      case 'TRANSACTION_REPLACED':
        return 'Transaction replaced by a new transaction!';
      case 'UNCONFIGURED_NAME':
        return 'Unconfigured name error!';
      case 'OFFCHAIN_FAULT':
        return 'Offchain fault error!';

      // User Interaction Errors
      case 'ACTION_REJECTED':
        return 'Action rejected by the user!';

      default:
        return 'Something went wrong!';
    }
  }
  return null;
}

export default defineComponent({
  methods: {
    getTextOfferState(offerState: number) {
      if (offerState === 0) {
        return 'Active';
      }
      if (offerState === 1) {
        return 'In work';
      }
      if (offerState === 2) {
        return 'Cancelled';
      }
      if (offerState === 3) {
        return 'Completed';
      }
    },
    getTextCastType(castType: number) {
      if (castType === 0) {
        return 'Recast';
      }
      if (castType === 1) {
        return 'Quote';
      }
    },
    secondsToDays(seconds: number) {
      const result = Math.floor(seconds / 86400);
      return result || 1;
    },
    copyText(text: string, showNotification = true) {
      copyToClipboard(text)
        .then(() => {
          if (showNotification) {
            this.$q.notify({
              message: 'Copied to clipboard!',
              position: this.$q.screen.gt.xs ? 'top-right' : 'top',
              classes: 'max-width-24rem',
            });
          }
        })
        .catch(() => {
          if (showNotification) {
            this.$q.notify({
              message: 'Failed to copy!',
              position: this.$q.screen.gt.xs ? 'top-right' : 'top',
              classes: 'max-width-24rem notify-error',
            });
          }
        });
    },
    formatDate(rowDate: string, mask = 'MM.DD.YYYY') {
      const processedDate = new Date(rowDate);
      return date.formatDate(processedDate, mask);
    },
    formatDateTime(rowDate: string) {
      const processedDate = new Date(rowDate);
      return date.formatDate(processedDate, 'MM.DD.YYYY, HH:mm');
    },
    numberWithSeparators(number: number) {
      if (number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      } else {
        return 0;
      }
    },
    capitalize(string: string) {
      return format.capitalize(string);
    },
    isEqual(obj1: unknown, obj2: unknown) {
      return is.deepEqual(obj1, obj2);
    },
    async handleMethodError(
      method: Promise<unknown> | (() => Promise<unknown>) | (() => void),
      errorMessage?: string,
      additionalErrorMethod?:
        | Promise<unknown>
        | (() => Promise<unknown>)
        | (() => void),
      finallyMethod?: Promise<void> | (() => Promise<void>) | (() => void)
    ) {
      try {
        typeof method === 'function' ? await method() : await method;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error);

        // Parse Error if no custom error message is provided
        if (!errorMessage) {
          errorMessage = parseError(error) || 'Something went wrong!';
        }

        this.$q.notify({
          message: errorMessage,
          position: this.$q.screen.gt.xs ? 'top-right' : 'top',
          classes: 'max-width-24rem notify-error',
        });

        if (additionalErrorMethod) {
          additionalErrorMethod && typeof additionalErrorMethod === 'function'
            ? await additionalErrorMethod()
            : await additionalErrorMethod;
        }
      } finally {
        finallyMethod &&
          (typeof finallyMethod === 'function'
            ? await finallyMethod()
            : await finallyMethod);
      }
    },
    scrollToLastElement(querySelector: string) {
      setTimeout(() => {
        const elements = document.querySelectorAll(querySelector);

        if (elements.length > 0) {
          const lastElement = elements[elements.length - 1] as HTMLElement;
          const target = getScrollTarget(lastElement);
          setVerticalScrollPosition(target, lastElement.offsetTop, 800);
        }
      }, 300);
    },
  },
});
