import React from 'react';
import Wallet from "core/components/Wallet/Wallet";
import styles from "./pages.module.css";

export default function WalletPage() {
  return (
    <div className={styles.pageContainer}>
      <Wallet/>
    </div>
  );
}