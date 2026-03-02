import React from "react";
import Language from "core/components/Language/Language";
import styles from "./pages.module.css";

export default function LanguagePage() {
  return (
    <div className={styles.pageContainer}>
      <Language/>
    </div>
  );
}