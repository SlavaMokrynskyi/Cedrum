// Copyright (c) Cedra
// SPDX-License-Identifier: Apache-2.0

import { Account, Ed25519Account, Ed25519PrivateKey } from "@cedra-labs/ts-sdk";
import {
  KEY_LENGTH,
  LAST_ACCOUNT_INDEX,
  SELECTED_CEDRA_WALLET_ACCOUNT,
  SELECTED_CEDRA_WALLET_ACCOUNTS,
} from "core/constants";
import { Result, SelectedCedraAccount, err, ok } from "core/types";

/**
 * Логін у Cedra акаунт через приватний ключ (hex)
 */
export function loginAccount(key: string): Result<Account, Error> {
  if (key.length !== KEY_LENGTH) {
    return err(new Error("Key is not the correct length"));
  }
  try {
    const privateKey = new Ed25519PrivateKey(key);
    const account = Account.fromPrivateKey({ privateKey });

    return ok(account);
  } catch (e) {
    return err(e as Error);
  }
}

/**
 * Створити новий акаунт Cedra
 */
export async function createNewAccount(): Promise<Ed25519Account> {
  const account = Account.generate();
  return account;
}

export const setSelectedAccountToStorage = async (
  account: SelectedCedraAccount | null,
) => {
  try {
    await chrome.storage.local.set({
      [SELECTED_CEDRA_WALLET_ACCOUNT]: JSON.stringify({ account }),
    });
  } catch (error) {
    console.error(error);
  }
};

type SelectedAccountStorageValue = {
  address: string;
  publicKey?: string;
  path?: string;
  walletName?: string | null;
};

const parseSelectedAccountStorageValue = (
  rawValue: unknown,
): SelectedAccountStorageValue | null => {
  if (!rawValue) return null;

  let value: any = rawValue;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }

  if (!value) return null;

  const accountValue = value.account ?? value;
  if (!accountValue?.address) return null;

  return accountValue as SelectedAccountStorageValue;
};

export const getSelectedAccountPublicDataFromStorage = async (): Promise<{
  address: string;
  publicKey?: string;
} | null> => {
  try {
    const item = await chrome.storage.local.get([SELECTED_CEDRA_WALLET_ACCOUNT]);
    const parsedValue = parseSelectedAccountStorageValue(
      item[SELECTED_CEDRA_WALLET_ACCOUNT],
    );

    if (!parsedValue) return null;

    return {
      address: parsedValue.address,
      ...(parsedValue.publicKey ? { publicKey: parsedValue.publicKey } : {}),
    };
  } catch {
    return null;
  }
};

export const getSelectedAccountFromStorage =
  async (): Promise<SelectedCedraAccount | null> => {
    try {
      const item = await chrome.storage.local.get([
        SELECTED_CEDRA_WALLET_ACCOUNT,
      ]);
      const parsedValue = parseSelectedAccountStorageValue(
        item[SELECTED_CEDRA_WALLET_ACCOUNT],
      );
      if (!parsedValue?.address || !parsedValue?.path) return null;

      const selectedAccount : SelectedCedraAccount = {
        address : parsedValue.address,
        publicKey : parsedValue.publicKey || "",
        path: parsedValue.path,
        walletName: parsedValue.walletName ?? null,
      }
      return selectedAccount;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

export const removeSelectedCedraAccount = async () => {
  try {
    await chrome.storage.local.remove([SELECTED_CEDRA_WALLET_ACCOUNT]);
  } catch (error) {
    console.error(error);
  }
};

/* ---------------- Wallet Accounts State ---------------- */

export const setAccountsStateToStorage = async (
  accounts: SelectedCedraAccount[] | null,
) => {
  try {
    await chrome.storage.local.set({
      [SELECTED_CEDRA_WALLET_ACCOUNTS]: JSON.stringify(accounts),
    });
  } catch (error) {
    console.error(error);
  }
};

export const getAccountsStateFromStorage = async () => {
  try {
    const item = await chrome.storage.local.get([
      SELECTED_CEDRA_WALLET_ACCOUNTS,
    ]);
    const rawValue = item[SELECTED_CEDRA_WALLET_ACCOUNTS];
    if (!rawValue) return [];

    const value =
      typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;

    return Array.isArray(value) ? (value as SelectedCedraAccount[]) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const removeAccountsState = async () => {
  try {
    await chrome.storage.local.remove([SELECTED_CEDRA_WALLET_ACCOUNTS]);
  } catch (error) {
    console.error(error);
  }
};

/* --------------- Last Derivation Path Index --------------- */

export const setLastDerivationIndexToStorage = async (index: number) => {
  try {
    await chrome.storage.local.set({ [LAST_ACCOUNT_INDEX]: index });
  } catch (error) {
    console.error(error);
  }
};

export const getLastDerivationIndexFromStorage = async (): Promise<number> => {
  try {
    const item = await chrome.storage.local.get([LAST_ACCOUNT_INDEX]);

    return item[LAST_ACCOUNT_INDEX]
      ? (JSON.parse(item[LAST_ACCOUNT_INDEX]) as number)
      : 0;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const removeLastDerivatationIndex = async () => {
  try {
    await chrome.storage.local.remove([LAST_ACCOUNT_INDEX]);
  } catch (error) {
    console.error(error);
  }
};
