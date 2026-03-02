// Copyright (c) Cedra
// SPDX-License-Identifier: Apache-2.0

export const DEV_ENVIRONMENT = false;

export const KEY_LENGTH: number = 64;
export const GAP_LIMIT = 20;
export const ITERATIONS = 600_000; // recomended iterations with SHA-256 (in 2023 by OWASP)
export const WALLET_STATE_NETWORK_KEY = "cedraWalletNetworkState";
export const SELECTED_CEDRA_WALLET_ACCOUNT = "selectedCedraAccount";
export const SELECTED_CEDRA_WALLET_ACCOUNTS = "selectedCedraAccounts";
export const LOCK_STATE = "lockState";
export const ADDRESSBOOK = "addressbook";
export const LANGUAGE = "language";
export const CONNECT_SITES = "connectSites";
export const SIDEBAR_STATE = "sidebarState";
export const PENDING_PAGE = "pendingPage";
export const LAST_ACCOUNT_INDEX = "lastAccountIndex";
export const ENCRYPTED_MNEMONIC_VAULT = "mnemonicPhraseVault";
export const SESSION_VAULT_KEY = "sessionVaultKey";
export const ACTIVE_INDEXES = "activeIndexes";

export const CREATE_COLLECTION_SCRIPT = "0x3::token::create_collection_script";
export const CREATE_TOKEN_SCRIPT = "0x3::token::create_token_script";
export const COIN_TRANSFER = "0x1::coin::transfer";
export const TOKEN_MINT_EVENT = "0x3::token::MintTokenEvent";
export const TOKEN_DIRECT_TRANSFER_SCRIPT =
  "0x3::token::direct_transfer_script";

export const COIN_DEPOSIT_EVENT = "0x1::fungible_asset::Deposit";
export const COIN_WITHDRAW_EVENT = "0x1::fungible_asset::Withdraw";
export const TOKEN_CREATE_COLLECTION_EVENT =
  "0x3::token::CreateCollectionEvent";
export const TOKEN_DEPOSIT_EVENT = "0x3::token::DepositEvent";
export const TOKEN_WITHDRAW_EVENT = "0x3::token::WithdrawEvent";

export const STATIC_GAS_ASSET = "0x1::CedraCoin::cedra";
export const STATIC_GAS_AMOUNT = 200;

export const LOCAL_NODE_URL = "http://0.0.0.0:8080";
export const LOCAL_FAUCET_URL = "http://0.0.0.0:8000";

export const DEVNET_NODE_URL = "https://devnet.cedra.dev/v1";
export const DEVNET_FAUCET_URL = "https://devnet-faucet.cedra.dev/";

export const TESTNET_NODE_URL = "https://testnet.cedra.dev/v1";
export const TESTNET_FAUCET_URL = "https://faucet.cedra.dev/";

export const MAINNET_NODE_URL = "https://mainnet.cedra.dev/v1";

export const PATH_CEDRA_COIN = "m/44'/637'/0'/0'";
export const NODE_URL = DEVNET_NODE_URL;
export const FAUCET_URL = DEVNET_FAUCET_URL;

export const CRYPTORANK_COINS_URL = "https://api.cryptorank.io/v0/coins";
