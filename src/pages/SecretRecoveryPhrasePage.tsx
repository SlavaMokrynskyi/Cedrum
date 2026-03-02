import React from "react";
import SecretRecoveryPhrase from "core/components/SecretRecoveryPhrase/SecretRecoveryPhrase";
import styles from "./pages.module.css";

export default function SecretRecoveryPhrasePage() {
  return (
    <div className={styles.pageContainer}>
      <SecretRecoveryPhrase />
    </div>
  );
}