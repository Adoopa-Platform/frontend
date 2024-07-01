import { defineStore } from 'pinia';
import { CastParamType, NeynarAPIClient } from '@neynar/nodejs-sdk';

const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY || '');

export interface FarcasterUserInterface {
  object: string;
  fid: number;
  custody_address: string;
  username: string;
  display_name: string;
  pfp_url: string;
  profile: {
    bio: {
      text: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
  active_status: string;
  power_badge: boolean;
}

export const useFarcasterStore = defineStore('farcaster', {
  state: () => ({}),
  actions: {
    async searchFarcasterUsers(search = 'vitalik') {
      const response = await neynarClient.searchUser(search);
      return response.result.users as FarcasterUserInterface[];
    },
    async getFarcasterUserByCustodyAddress(custodyAddress: string) {
      const response = await neynarClient.lookupUserByCustodyAddress(
        custodyAddress
      );
      return response.user as FarcasterUserInterface;
    },
    async getFarcasterCastByURL(url: string) {
      const response = await neynarClient.lookUpCastByHashOrWarpcastUrl(
        url,
        CastParamType.Url
      );
      return response.cast;
    },
  },
});
