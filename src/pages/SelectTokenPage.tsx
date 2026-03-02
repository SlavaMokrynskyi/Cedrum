import React from "react";
import SelectToken from "core/components/SelectToken/SelectToken";
import styles from "./pages.module.css";

export default function SelectTokenPage() {
  return (
      <div className={styles.pageContainer}>
        <SelectToken/>
      </div>
  );
}
