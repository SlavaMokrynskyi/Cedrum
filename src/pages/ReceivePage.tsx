import React from "react";
import Receive from "core/components/Receive/Receive";
import styles from "./pages.module.css";

export default function ReceivePage() {
  return (
    <div className={styles.pageContainer}>
      <Receive/>
    </div>
  );
}