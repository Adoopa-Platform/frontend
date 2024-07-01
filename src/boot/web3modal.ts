import { boot } from 'quasar/wrappers';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue';

export const availableChains = [
  {
    chainId: 8453,
    name: 'Base',
    currency: 'ETH',
    explorerUrl: 'https://basescan.org/',
    rpcUrl: 'https://mainnet.base.org',
  },
];

export default boot(({}) => {
  const projectId = process.env.WALLETCONNECT_PROJECT_KEY || '';

  const metadata = {
    name: 'FarAd',
    description: 'promoting platform for Farcaster',
    url: 'https://localhost/', // url must match your domain & subdomain
    icons: ['https://avatars.mywebsite.com/'],
  };

  const ethersConfig = defaultConfig({
    /*Required*/
    metadata,
    /*Optional*/
    enableEIP6963: true, // true by default
    enableInjected: true, // true by default
    enableCoinbase: true, // true by default
    defaultChainId: 8453, // used for the Coinbase SDK
  });

  createWeb3Modal({
    ethersConfig,
    chains: availableChains,
    projectId,
    enableAnalytics: true, // Optional - defaults to your Cloud configuration
    themeVariables: {
      '--w3m-font-family': 'Montserrat, Roboto, sans-serif',
      '--w3m-accent': '#3a78ed',
    },
  });
});
