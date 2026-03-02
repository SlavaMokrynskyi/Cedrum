import React from "react";
import EnterRecoveryPhrase from "core/components/EnterRecoveryPhrase/EnterRecoveryPhrase";
import styles from "./pages.module.css";

export default function EnterRecoveryPhrasePage() {
  return (
    <div className={styles.pageContainer}>
      <EnterRecoveryPhrase />
    </div>
  );
}