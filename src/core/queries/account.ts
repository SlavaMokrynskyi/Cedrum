// Copyright (c) Cedra
// SPDX-License-Identifier: Apache-2.0

import { CedraNetwork, getNetworkState } from "core/utils/network";
import {
  CedraConfig,
  Cedra,
  AccountAddress,
  MoveResource,
  Network,
  Account,
  Ed25519Account,
} from "@cedra-labs/ts-sdk";
import { QueryFunctionContext } from "@tanstack/react-query";
import { GAP_LIMIT, PATH_CEDRA_COIN } from "core/constants";
import { CreateWalletStateProps } from "core/hooks/useWalletState";
import { decryptByVaultKey } from "core/utils/seedPhrase";
import { setLastDerivationIndexToStorage } from "core/utils/account";

export interface GetAccountResourcesProps {
  address?: AccountAddress;
  nodeUrl: Network;
}

export interface CreateWalletStatesProps {
  createWalletState : ({ account, path, walletName }: CreateWalletStateProps) => Promise<void>;
}


export const getAccountResources = async ({
  address,
  nodeUrl,
}: GetAccountResourcesProps) => {
  const client = new Cedra(new CedraConfig({ network: nodeUrl }));
  return address
    ? client.getAccountResources({ accountAddress: address })
    : undefined;
};

export const getAccountBalanceFromAccountResources = (
  accountResources: MoveResource[] | undefined,
): Number => {
  if (accountResources) {
    const accountResource = accountResources
      ? accountResources?.find(
          (r) => r.type === "0x1::Coin::CoinStore<0x1::TestCoin::TestCoin>",
        )
      : undefined;
    const tokenBalance = accountResource
      ? (accountResource.data as { coin: { value: string } }).coin.value
      : undefined;
    return Number(tokenBalance);
  }
  return -1;
};

export interface GetResourceFromAccountResources {
  accountResources: MoveResource[] | undefined;
  resource: string;
}

export const getResourceFromAccountResources = ({
  accountResources,
  resource,
}: GetResourceFromAccountResources) =>
  accountResources
    ? accountResources?.find((r) => r.type === resource)
    : undefined;

export type GetTestCoinTokenBalanceFromAccountResourcesProps = Omit<
  GetResourceFromAccountResources,
  "resource"
>;

export const getTestCoinTokenBalanceFromAccountResources = ({
  accountResources,
}: GetTestCoinTokenBalanceFromAccountResourcesProps) => {
  const testCoinResource = getResourceFromAccountResources({
    accountResources,
    resource: "0x1::coin::CoinStore<0x1::cedra_coin::CedraCoin>",
  });
  const tokenBalance = testCoinResource
    ? (testCoinResource.data as { coin: { value: string } }).coin.value
    : undefined;
  return tokenBalance;
};

export const getAccountExists = async ({
  address,
  nodeUrl,
}: GetAccountResourcesProps) => {
  const client = new Cedra(new CedraConfig({ network: nodeUrl }));
  try {
    if (address) {
      const account = client.account;
      return !!account;
    }
  } catch (err) {
    return false;
  }
  return false;
};

type GetToAddressAccountExistsKey = readonly [
  "getToAddressAccountExists",
  {
    cedraAccount: Ed25519Account | null;
    nodeUrl: CedraNetwork;
    toAddress?: AccountAddress | null;
  },
];

export const getToAddressAccountExists = async (
  ctx: QueryFunctionContext<GetToAddressAccountExistsKey>,
): Promise<boolean> => {
  const [, { cedraAccount, nodeUrl, toAddress }] = ctx.queryKey;

  if (!cedraAccount || !toAddress) return false;

  return getAccountExists({
    address: toAddress,
    nodeUrl,
  });
};

/**
 * Check active addresses using derivation path index with limit(20)
 * returns array of indexes
 */
export const checkActiveAddresses = async (
  mnemonic: string,
): Promise<number[]> => {
  let currentIndex = 0;
  let currentGap = 0;
  let lastActiveIndex = -1;

  const activeIndexes: number[] = [];
  const nodeUrl = await getNetworkState();

  while (currentGap < GAP_LIMIT) {
    const account = Account.fromDerivationPath({
      mnemonic,
      path: `${PATH_CEDRA_COIN}/${currentIndex}'`,
    });

    const exists = await getAccountResources({
      address: account.accountAddress,
      nodeUrl,
    });

    if (exists?.length !== 0) {
      activeIndexes.push(currentIndex);
      lastActiveIndex = currentIndex;
      currentGap = 0;
    } else {
      currentGap++;
    }

    currentIndex++;
  }

  if (lastActiveIndex >= 0) {
    await setLastDerivationIndexToStorage(lastActiveIndex);
  }

  return activeIndexes;
};

export const createWalletsStates = async ({
  createWalletState
}: CreateWalletStatesProps): Promise<boolean> => {
  try {
    const mnemonic = await decryptByVaultKey()
    if(!mnemonic) return false;
    const activeIndexes = await checkActiveAddresses(mnemonic);

    activeIndexes.map((index) => {
      const account = Account.fromDerivationPath({
        path: `${PATH_CEDRA_COIN}/${index}'`,
        mnemonic: mnemonic,
      });
      createWalletState(
        {
          account : account,
          path: `${PATH_CEDRA_COIN}/${index}'`,
          walletName: null,
        }
      );
      return true;
    });
    return true;
  } catch (error) {
    console.error("Error : ", error);
    return false;
  }
};
