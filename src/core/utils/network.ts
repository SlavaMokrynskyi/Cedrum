// Copyright (c) Cedra
// SPDX-License-Identifier: Apache-2.0

import { WALLET_STATE_NETWORK_KEY } from "core/constants";
import { Network } from "@cedra-labs/ts-sdk";

export const DEVNET_NODE_URL = "https://devnet.cedra.dev/v1";
export const TESTNET_NODE_URL = "https://testnet.cedra.dev/v1";
export const MAINNET_NODE_URL = "https://mainnet.cedra.dev/v1";
export const LOCAL_NODE_URL = "http://0.0.0.0:8080";

export const DEVNET_FAUCET_URL = "https://devnet-faucet.cedra.dev/";
export const TESTNET_FAUCET_URL = "https://faucet.cedra.dev/";
export const LOCAL_FAUCET_URL = "http://0.0.0.0:8000";

export type CedraNetwork =
  | typeof Network.LOCAL
  | typeof Network.DEVNET
  | typeof Network.TESTNET
  | typeof Network.MAINNET;

export type FaucetNetwork =
  | typeof LOCAL_FAUCET_URL
  | typeof DEVNET_FAUCET_URL
  | typeof TESTNET_FAUCET_URL
  | null;

export const networkUriMap: Record<string | number, string> = {
  [LOCAL_NODE_URL]: "Localhost",
  [DEVNET_NODE_URL]: "Devnet",
  [TESTNET_NODE_URL]: "Testnet",
  [MAINNET_NODE_URL]: "Mainnet",
};

export const faucetUriMap = Object.freeze({
  [LOCAL_NODE_URL]: LOCAL_FAUCET_URL,
  [DEVNET_NODE_URL]: DEVNET_FAUCET_URL,
  [TESTNET_NODE_URL]: TESTNET_FAUCET_URL,
  [MAINNET_NODE_URL]: null,
} as const);

export async function getNetworkState(): Promise<CedraNetwork> {
  try {
    const result = await chrome.storage.local.get([
      WALLET_STATE_NETWORK_KEY,
    ]);
    return (
      (result[WALLET_STATE_NETWORK_KEY] as CedraNetwork | null) ||
      Network.DEVNET
    );
  } catch (error) {
    console.error(error);
    return Network.DEVNET
  }
}

export const setNetworkState = async (network: CedraNetwork) => {
  try {
    await chrome.storage.local.set({
      [WALLET_STATE_NETWORK_KEY]: network,
    });
  } catch (error) {
    console.error(error);
  }
};

export const removeNetworkState = async() => {
  try{
    await chrome.storage.local.remove([WALLET_STATE_NETWORK_KEY])
  }catch(error){
    console.error(error)
  }
}


function assertNeverNetwork(x: never): never {
  throw new Error(`Unexpected network: ${x}`);
}

export function getFaucetNetworkFromCedraNetwork(
  cedraNetwork: CedraNetwork,
): FaucetNetwork | null {
  switch (cedraNetwork) {
    case Network.DEVNET:
      return faucetUriMap[DEVNET_NODE_URL];
    case Network.LOCAL:
      return faucetUriMap[LOCAL_NODE_URL];
    case Network.TESTNET:
      return faucetUriMap[TESTNET_NODE_URL];
    case Network.MAINNET:
      return faucetUriMap[MAINNET_NODE_URL];
    default:
      return assertNeverNetwork(cedraNetwork);
  }
}
