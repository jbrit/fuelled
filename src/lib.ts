import { Account, BN, createAssetId, TESTNET_NETWORK_URL } from 'fuels';

// The two environments for the dapp are local and testnet.
export const Environments = {
  LOCAL: 'local',
  TESTNET: 'testnet',
} as const;
type Environment = (typeof Environments)[keyof typeof Environments];


export const CURRENT_ENVIRONMENT: Environment =
  (process.env.VITE_DAPP_ENVIRONMENT as Environment) || Environments.LOCAL;

export const NODE_URL =
  CURRENT_ENVIRONMENT === Environments.LOCAL
    ? `http://127.0.0.1:${process.env.VITE_FUEL_NODE_PORT || 4000}/v1/graphql`
    : TESTNET_NETWORK_URL;

export interface AppWallet {
  wallet?: Account;
  walletBalance?: BN;
  refreshWalletBalance?: () => Promise<void>;
}

export const TESTNET_FAUCET_LINK = 'https://faucet-testnet.fuel.network/';

export const FAUCET_LINK = '/faucet';
// CURRENT_ENVIRONMENT === Environments.LOCAL ? '/faucet' : TESTNET_FAUCET_LINK;

export const FAUCET_PRIVATE_KEY = '0x01';

export const DOCS_URL = 'https://docs.fuel.network';

export const TESTNET_MEME_FACTORY_CONTRACT_ID = process.env.VITE_TESTNET_MEME_FACTORY_CONTRACT_ID as string;
export const B256_ZERO = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const BASE_ASSET_CONTRACT_ID = process.env.VITE_BASE_ASSET_CONTRACT_ID ?? B256_ZERO;
export const BASE_ASSET_ID = createAssetId(BASE_ASSET_CONTRACT_ID, B256_ZERO).bits;
export const INDEXER_GRAPHQL_URL = process.env.VITE_INDEXER_GRAPHQL_URL as string;