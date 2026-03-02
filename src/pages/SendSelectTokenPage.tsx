import React from "react";
import SendSelectToken from "core/components/SendSelectToken/SendSelectToken";
import styles from "./pages.module.css";

export default function SendSelectTokenPage() {
  return (
      <div className={styles.pageContainer}>
        <SendSelectToken/>
      </div>
  );
}
