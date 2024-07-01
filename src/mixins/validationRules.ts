import { defineComponent } from 'vue';
const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,5}$/;

export default defineComponent({
  data() {
    return {
      validationRules: {
        dummy: () => true,
        required: (value: string | number) =>
          (typeof value == 'string'
            ? value && value !== null && value !== ''
            : value !== null && value !== undefined) || 'Required',
        asin: (value: string) =>
          value.length == 10 || 'Must be 10 characters length',
        isEmail: (value: string) =>
          emailPattern.test(value) ||
          value === undefined ||
          value === null ||
          value === '' ||
          'Invalid email',
        naturalNumber: (value: number) => value > 0 || 'Min: 1',
        naturalNumberOrNull: (value: number) => value >= 0 || 'Min: 0',
        minOfferReward: (value: number) => value >= 0.00001 || 'Min: 0.00001',
        phone: (value: string) => {
          const phonePattern = /^\+?(\d.*){3,}$/;
          return (
            phonePattern.test(value) ||
            value === undefined ||
            value === null ||
            value === '' ||
            'Invalid phone number'
          );
        },
        validUrlWithProtocol: (value: string) => {
          const urlPattern =
            /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,})(?:\/[^\s]*)?$/;
          return (
            urlPattern.test(value) ||
            value === undefined ||
            value === null ||
            value === '' ||
            'Invalid url'
          );
        },

        isValidPassword: {
          length: (value: string) =>
            /^.{12,}$/.test(value) || 'Password must be at least 12 characters',
          lowercase: (value: string) =>
            /^(?=.*[a-z])/.test(value) ||
            'Password must contain at least one lowercase letter',
          uppercase: (value: string) =>
            /^(?=.*[A-Z])/.test(value) ||
            'Password must contain at least one uppercase letter',
          number: (value: string) =>
            /^(?=.*\d)/.test(value) ||
            'Password must contain at least one number',
        },
      },
    };
  },
});
