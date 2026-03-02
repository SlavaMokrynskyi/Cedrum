import React, { useState } from "react";
import styles from "./Wallet.module.css";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import { useNavigate } from "react-router-dom";
import useWalletState from "core/hooks/useWalletState";
import { Account } from "@cedra-labs/ts-sdk";
import { PATH_CEDRA_COIN } from "core/constants";
import WalletCard from "../WalletCard/WalletCard";
import { decryptByVaultKey } from "core/utils/seedPhrase";
import {
  getLastDerivationIndexFromStorage,
  setLastDerivationIndexToStorage,
} from "core/utils/account";

export default function Wallet() {
  const navigate = useNavigate();
  const { cedraAccounts, createWalletState } = useWalletState();
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const handleAddWallet = async () => {
    const lastIndex = await getLastDerivationIndexFromStorage();
    const nextIndex = lastIndex + 1;

    const mnemonic = await decryptByVaultKey();
    if (!mnemonic) return;

    const path = `${PATH_CEDRA_COIN}/${nextIndex}'`;

    const newAccount = Account.fromDerivationPath({
      path,
      mnemonic,
    });

    await createWalletState({
      account: newAccount,
      path,
      walletName: null,
    });

    await setLastDerivationIndexToStorage(nextIndex);
    navigate("/wallet/portfolio")
  };

  const handleCopySuccess = () => {
    setCopyMessage("Address copied");
    setTimeout(() => setCopyMessage(null), 2000);
  };

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <ArrowLeftSvg className={styles.backIcon} />
      </button>

      <h1 className={styles.title}>Wallet</h1>

      {copyMessage && (
        <div className={styles.copyMessage}>{copyMessage}</div>
      )}

      <div className={styles.walletsList}>
        {(cedraAccounts ?? []).map((account) => (
          <WalletCard
            key={account.publicKey}
            accountAddress={account.address}
            walletName={account.walletName ?? "wallet"}
            publicKey={account.publicKey}
            path={account.path}
            onCopySuccess={handleCopySuccess}
          />
        ))}
      </div>

      <button className={styles.addWalletButton} onClick={handleAddWallet}>
        + add new Cedra wallet
      </button>
    </div>
  );
}
