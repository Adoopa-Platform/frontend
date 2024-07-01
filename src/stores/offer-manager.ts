import { defineStore } from 'pinia';
import {
  BrowserProvider,
  Contract,
  Eip1193Provider,
  formatUnits,
  parseUnits,
} from 'ethers';
import { useWeb3ModalProvider, useSwitchNetwork } from '@web3modal/ethers/vue';
import { api } from 'src/boot/axios';

const contractAdress = '0x5cC1e28e546906d09b0006d84755f8F216996004';

export const commissionPercentage = 0.01;

const contractABI = [
  'constructor(address initialOwner)',
  'event NewOfferCreated(uint256 indexed offerId, address indexed offerer, address indexed receiver, uint256 price, address token, uint256 duration, string castURL, uint8 castType)',
  'event OfferCanceled(uint256 indexed offerId)',
  'event OfferTaken(uint256 indexed offerId)',
  'event OfferCompleted(uint256 indexed offerId)',
  'function owner() view returns (address)',
  'function renounceOwnership()',
  'function transferOwnership(address newOwner)',
  'function currentOfferId() view returns (uint256)',
  'function acceptedTokens(address) view returns (bool)',
  'function offers(uint256) view returns (uint256 offerId, address offerer, address receiver, uint256 price, address token, uint256 acceptTimestamp, uint256 duration, string castURL, uint8 castType, uint8 offerState)',
  'function feePercentage() view returns (uint256)',
  'function feeReceiver() view returns (address)',
  'function signer() view returns (address)',
  'function editAcceptedTokens(address[] tokens, bool[] isAccepted)',
  'function editFeeAmount(uint256 newFeePercentage)',
  'function editFeeReceiver(address newFeeReceiver)',
  'function editSigner(address newSigner)',
  'function getOffersByIds(uint256 startOfferId, uint256 limit) view returns (tuple(uint256 offerId, address offerer, address receiver, uint256 price, address token, uint256 acceptTimestamp, uint256 duration, string castURL, uint8 castType, uint8 offerState)[])',
  'function getOffersByAddress(address user) view returns (tuple(uint256 offerId, address offerer, address receiver, uint256 price, address token, uint256 acceptTimestamp, uint256 duration, string castURL, uint8 castType, uint8 offerState)[] offers, bool[] isOfferer)',
  'function createOffer(address receiver, uint256 price, address token, uint256 duration, string castURL, uint8 castType)',
  'function cancelOffer(uint256 offerId, uint8 v, bytes32 r, bytes32 s)',
  'function takeOffer(uint256 offerId)',
  'function completeOffer(uint256 offerId, uint8 v, bytes32 r, bytes32 s)',
];

export enum OfferState {
  CREATED,
  ACCEPTED,
  CANCELED,
  COMPLETED,
}

export enum CastType {
  RECAST,
  QUOTE,
}

export interface OfferInterface {
  offerId?: number;
  offerer?: string; // Address of the offer creator
  receiver?: string; // Address of the offer recipient
  price?: number; // Price of the offer
  token?: string; // Address of the token used for the offer (could be ERC20 token address or `0x0` for ETH)
  acceptTimestamp?: number; // Timestamp when the offer was accepted (relevant in INWORK state)
  duration?: number; // Duration for which the offer is valid
  castURL?: string; // URL related to the offer, potentially a media or other reference
  castType?: number; // Type of cast (RECAST or QUOTE)
  offerState?: number; // Current state of the offer
}

interface OfferInputInterface {
  [key: number]: string | number;
}

function parseOfferInput(input: OfferInputInterface): OfferInterface {
  // This assumes the input values are strictly in the order of the OfferInterface properties
  const offer: OfferInterface = {
    offerId: Number(input[0]),
    offerer: input[1] as string,
    receiver: input[2] as string,
    price: Number(input[3]),
    token: input[4] as string,
    acceptTimestamp: Number(input[5]),
    duration: Number(input[6]),
    castURL: input[7] as string,
    castType: Number(input[8]) as CastType, // This assumes the input is a valid number for CastType
    offerState: Number(input[9]) as OfferState, // This assumes the input is a valid number for OfferState
  };

  // Format price to ETH
  offer.price = Number(formatUnits(String(offer.price), 'ether'));

  return offer;
}

export const useOfferManagerStore = defineStore('offerManager', {
  state: () => ({
    offersList: [] as OfferInterface[],
    offersListLoading: 0,
    allOffersList: [] as OfferInterface[],
    lastUpdateTimestamp: 0,
    ethBalance: 0,
  }),
  actions: {
    async getOffersByAddress(updateList = false) {
      try {
        const updateStartTimestamp = Date.now();

        if (updateList) {
          this.offersListLoading++;
        }

        const { walletProvider } = useWeb3ModalProvider();
        const ethersProvider = new BrowserProvider(
          walletProvider.value as Eip1193Provider
        );

        const signer = await ethersProvider.getSigner();
        const contract = new Contract(contractAdress, contractABI, signer);
        const txResponse = await contract.getOffersByAddress(
          signer.getAddress()
        );
        const offers = [] as OfferInterface[];

        txResponse.offers.forEach((offer: OfferInputInterface) => {
          offers.unshift(parseOfferInput(offer));
        });

        if (updateList) {
          // check if at least 1s passed since the start of the update and if not wait for the remaining time
          const updateEndTimestamp = Date.now();
          const updateDuration = updateEndTimestamp - updateStartTimestamp;
          if (updateDuration < 1000) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 - updateDuration)
            );
          }

          const blockNumber = await ethersProvider.getBlockNumber();
          const block = await ethersProvider.getBlock(blockNumber);
          this.lastUpdateTimestamp = block ? block.timestamp : 0;

          this.offersList = offers;
        }

        return offers;
      } catch (error) {
        throw error;
      } finally {
        if (updateList) this.offersListLoading--;
      }
    },

    async getAllOffers(updateList = false) {
      const { walletProvider } = useWeb3ModalProvider();
      const ethersProvider = new BrowserProvider(
        walletProvider.value as Eip1193Provider
      );

      const signer = await ethersProvider.getSigner();
      const contract = new Contract(contractAdress, contractABI, signer);
      const currentOfferId = await contract.currentOfferId();
      const offers = [] as OfferInterface[];

      for (let i = 1; i <= currentOfferId; i++) {
        const offer = await contract.offers(i);
        offers.unshift(parseOfferInput(offer));
      }

      if (updateList) {
        this.allOffersList = offers;
      }

      return offers;
    },

    async createOffer(
      receiver: string,
      price: number,
      token: string,
      duration: number,
      castURL: string,
      castType: number
    ) {
      const { walletProvider } = useWeb3ModalProvider();
      const ethersProvider = new BrowserProvider(
        walletProvider.value as Eip1193Provider
      );
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(contractAdress, contractABI, signer);
      const priceInWei = parseUnits(String(price), 'ether');
      const txResponse = await contract.createOffer(
        receiver,
        priceInWei,
        token,
        duration,
        castURL,
        castType,
        {
          value: priceInWei,
        }
      );
      await txResponse.wait();

      return txResponse;
    },

    async cancelOffer(offerId: number, v: number, r: string, s: string) {
      const { walletProvider } = useWeb3ModalProvider();
      const ethersProvider = new BrowserProvider(
        walletProvider.value as Eip1193Provider
      );
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(contractAdress, contractABI, signer);
      const txResponse = await contract.cancelOffer(offerId, v, r, s);
      await txResponse.wait();

      return txResponse;
    },

    async acceptOffer(offerId: number) {
      const { walletProvider } = useWeb3ModalProvider();
      const ethersProvider = new BrowserProvider(
        walletProvider.value as Eip1193Provider
      );
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(contractAdress, contractABI, signer);
      const txResponse = await contract.takeOffer(offerId);
      await txResponse.wait();

      return txResponse;
    },

    async completeOffer(offerId: number, v: number, r: string, s: string) {
      const { walletProvider } = useWeb3ModalProvider();
      const ethersProvider = new BrowserProvider(
        walletProvider.value as Eip1193Provider
      );
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(contractAdress, contractABI, signer);
      const txResponse = await contract.completeOffer(offerId, v, r, s);
      await txResponse.wait();

      return txResponse;
    },

    async getVereficationResult(offerId: number) {
      const response = await api.get(`/validate?offerId=${offerId}`);

      return response.data;
    },

    async checkAndChangeNetwork() {
      const { walletProvider } = useWeb3ModalProvider();
      const ethersProvider = new BrowserProvider(
        walletProvider.value as Eip1193Provider
      );
      const network = await ethersProvider.getNetwork();

      if (Number(network.chainId) !== 84532) {
        const { switchNetwork } = useSwitchNetwork();
        await switchNetwork(84532);
      }
    },

    async getEthBalance() {
      const { walletProvider } = useWeb3ModalProvider();
      const ethersProvider = new BrowserProvider(
        walletProvider.value as Eip1193Provider
      );
      const signer = await ethersProvider.getSigner();
      const balance = await ethersProvider.getBalance(signer.getAddress());
      const ethBalance = Number(formatUnits(balance, 'ether'));

      this.ethBalance = ethBalance;

      return ethBalance;
    },

    async getLastBlockTimestamp() {
      const { walletProvider } = useWeb3ModalProvider();
      const ethersProvider = new BrowserProvider(
        walletProvider.value as Eip1193Provider
      );
      const blockNumber = await ethersProvider.getBlockNumber();
      const block = await ethersProvider.getBlock(blockNumber);

      return block ? block.timestamp : 0;
    },

    async estimateGas(method: string) {
      console.log('estimateGas', method);

      // TODO: fix this, something is wrong with the estimateGas method
      // const { walletProvider } = useWeb3ModalProvider();
      // const ethersProvider = new BrowserProvider(
      //   walletProvider.value as Eip1193Provider
      // );
      // const signer = await ethersProvider.getSigner();
      // const contract = new Contract(contractAdress, contractABI, signer);

      // const estimate = await contract.estimateGas.createOffer();
      // const ethEstimate = Number(formatUnits(estimate, 'ether'));

      const ethEstimate = 0.00001;

      return ethEstimate;
    },

    calculateScore(offers: OfferInterface[]) {
      // Recast - 50
      // Quote - 100
      // 1 ETH Fee - 350000

      let score = 0;

      offers.forEach((offer) => {
        if (offer.castType === 0) {
          score += 50;
        } else if (offer.castType === 1) {
          score += 100;
        }

        score += (offer.price || 0) * commissionPercentage * 350000;
      });
      return score;
    },
  },
});
