// Copyright (c) Cedra
// SPDX-License-Identifier: Apache-2.0

import { useState, useCallback, useMemo, useEffect } from "react";
import constate from "constate";
import {
  getAccountsStateFromStorage,
  getSelectedAccountFromStorage,
  removeAccountsState,
  removeLastDerivatationIndex,
  removeSelectedCedraAccount,
  setAccountsStateToStorage,
  setSelectedAccountToStorage,
} from "core/utils/account";
import {
  CedraNetwork,
  FaucetNetwork,
  getFaucetNetworkFromCedraNetwork,
  getNetworkState,
  removeNetworkState,
  setNetworkState,
} from "core/utils/network";

import {
  getAddressbookState,
  removeAddressBook,
  updateAddressbookState,
} from "core/utils/addressbook";
import {
  getLanguageState,
  removeLanguageState,
  updateLanguageState,
} from "core/utils/language";
import { Account, Ed25519Account, Network } from "@cedra-labs/ts-sdk";
import { SelectedCedraAccount } from "core/types";
import { decryptByVaultKey, removeMnemonicVault } from "core/utils/seedPhrase";
import { removeSitesState } from "core/utils/connectSites";
import { lockSessionNow } from "core/utils/lock";

export interface UpdateWalletStateProps {
  cedraAccountState: Ed25519Account;
}

export interface UpdateCedraAccountsStateProps {
  accounts?: any;
}

export interface UpdateCedraAccountProps {
  cedraAccountState: Ed25519Account;
}

export interface UpdateAddressbookListProps {
  name: string | null;
  address: string | null;
}

export interface UpdateLanguageProps {
  name: string;
  shortName: string;
}

export interface CreateWalletStateProps {
  account: Ed25519Account;
  path: string;
  walletName: string | null;
}

export default function useWalletState() {
  const [cedraAccount, setCedraAccount] = useState<Ed25519Account | null>(null);

  const [cedraNetwork, setCedraNetwork] = useState<CedraNetwork>(
    Network.TESTNET,
  );

  const [cedraAccounts, setCedraAccounts] = useState<SelectedCedraAccount[]>(
    [],
  );

  const [addressbookList, setAddressbookList] = useState<
    UpdateAddressbookListProps[] | null | undefined
  >(undefined);

  const [language, setLanguage] = useState<
    UpdateLanguageProps | null | undefined
  >({
    name: "English",
    shortName: "EN",
  });

  /* ---------------- Network ---------------- */

  useEffect(() => {
    const fetchNetwork = async () => {
      const network = await getNetworkState();
      setCedraNetwork(network);
    };
    fetchNetwork();
  }, []);

  const faucetNetwork: FaucetNetwork | null | undefined = useMemo(
    () => getFaucetNetworkFromCedraNetwork(cedraNetwork),
    [cedraNetwork],
  );

  const updateNetworkState = useCallback((network: CedraNetwork) => {
    setCedraNetwork(network);
    setNetworkState(network);
  }, []);

  /* ---------------- Language ---------------- */

  const updateLanguage = useCallback(
    (languageInfo: UpdateLanguageProps | null) => {
      setLanguage(languageInfo);
      updateLanguageState(languageInfo);
    },
    [],
  );

  /* ---------------- Addressbook ---------------- */

  const updateAddressbookList = useCallback(
    (addressInfo: UpdateAddressbookListProps) => {
      if (!addressInfo?.address) return;

      const list = addressbookList ?? [];
      const exists = list.some((a) => a.address === addressInfo.address);
      if (exists) return;

      const newList = [...list, addressInfo];
      setAddressbookList(newList);
      updateAddressbookState(newList);
    },
    [addressbookList],
  );

  const removeAddressFromAddressbook = useCallback(
    (addressToRemove: string) => {
      const list = addressbookList ?? [];
      const updated = list.filter((a) => a.address !== addressToRemove);
      setAddressbookList(updated.length ? updated : null);
      updateAddressbookState(updated.length ? updated : null);
    },
    [addressbookList],
  );

  /* ---------------- Cedra Account State ---------------- */

  const updateCedraAccountsState = useCallback(
    async (accounts: SelectedCedraAccount[]) => {
      await setAccountsStateToStorage(accounts);
      setCedraAccounts(accounts);
    },
    [],
  );

  const updateSelectedCedraAccountState = useCallback(
    async (account: Ed25519Account, selected: SelectedCedraAccount) => {
      setCedraAccount(account);
      await setSelectedAccountToStorage(selected);
    },
    [],
  );

  const clearCedraAccountState = useCallback(async () => {
    setCedraAccount(null);
    setCedraAccounts([]);
    setAddressbookList(null);

    await Promise.all([
      removeAddressBook(),
      removeLanguageState(),
      removeSelectedCedraAccount(),
      removeAccountsState(),
      removeNetworkState(),
      removeLastDerivatationIndex(), // IMPORTANT: invoke
      removeSitesState(),
      removeMnemonicVault(),
      lockSessionNow(),
    ]);
  }, []);

  /* ---------------- Wallet State ---------------- */

  const createWalletState = useCallback(
    async ({ account, path, walletName = null }: CreateWalletStateProps) => {
      let finalName = walletName;

      if (!finalName) {
        let biggest = 0;
        (cedraAccounts ?? []).forEach((a) => {
          const parts = a.walletName?.split(" ");
          if (parts?.length === 2 && parts[0] === "Wallet") {
            const num = Number(parts[1]);
            if (Number.isFinite(num)) biggest = Math.max(biggest, num);
          }
        });
        finalName = `Wallet ${biggest + 1}`;
      }

      const selected: SelectedCedraAccount = {
        address: account.accountAddress.toString(),
        publicKey: account.publicKey.toString(),
        path,
        walletName: finalName,
      };

      await updateCedraAccountsState([...cedraAccounts, selected]);
      await updateSelectedCedraAccountState(account, selected);
    },
    [cedraAccounts, updateCedraAccountsState, updateSelectedCedraAccountState],
  );

  const updateWalletState = useCallback(
    async ({ account, path, walletName }: CreateWalletStateProps) => {
      const updated: SelectedCedraAccount = {
        address: account.accountAddress.toString(),
        publicKey: account.publicKey.toString(),
        path,
        walletName,
      };

      const idx = cedraAccounts.findIndex((a) => a.path === path);

      if (idx === -1) return;

      const next = cedraAccounts.map((a, i) =>
        i === idx ? { ...a, ...updated } : a,
      );

      await updateCedraAccountsState(next);
      await updateSelectedCedraAccountState(account, updated);
    },
    [cedraAccounts, updateCedraAccountsState, updateSelectedCedraAccountState],
  );

  const getAccountInfoByAddress = (accountAddress : string): SelectedCedraAccount | null => {
    if (!accountAddress) return null;

    const account = (cedraAccounts ?? []).find((acc) => acc.address === accountAddress);
    return account ?? null;
  };

  const signOut = useCallback(async () => {
    try {
      await clearCedraAccountState();
    } catch (error) {
      console.error(error);
      await clearCedraAccountState();
    }
  }, [clearCedraAccountState]);

  /* ---------------- Load from storage ---------------- */

  const getDataFromStorage = useCallback(async () => {
    try {
      const [selectedAccount, accounts, network, addressBook, lang, mnemonic] =
        await Promise.all([
          getSelectedAccountFromStorage(),
          getAccountsStateFromStorage(),
          getNetworkState(),
          getAddressbookState(),
          getLanguageState(),
          decryptByVaultKey(),
        ]);

      // network
      setCedraNetwork(network);

      // lists
      setCedraAccounts(accounts ?? []);
      setAddressbookList(addressBook ?? null);
      setLanguage(lang ?? { name: "English", shortName: "EN" });

      if (!selectedAccount || !mnemonic) return;

      const account = Account.fromDerivationPath({
        mnemonic,
        path: selectedAccount.path,
      });

      setCedraAccount(account);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    getDataFromStorage();
  }, [getDataFromStorage]);

  return {
    addressbookList,
    cedraAccount,
    cedraAccounts,
    cedraNetwork,
    faucetNetwork,
    language,
    createWalletState,
    setCedraAccounts,
    signOut,
    updateNetworkState,
    updateSelectedCedraAccountState,
    updateWalletState,
    updateAddressbookList,
    removeAddressFromAddressbook,
    updateLanguage,
    getAccountInfoByAddress,
  };
}

export const [WalletStateProvider, useWalletStateContext] =
  constate(useWalletState);
