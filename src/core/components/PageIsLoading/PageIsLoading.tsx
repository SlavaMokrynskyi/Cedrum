import React from "react";
import styles from "./PageIsLoading.module.css";
import { CedrumLogoSvg } from "core/image/CedrumLogoSvg";

export default function PageIsLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <CedrumLogoSvg className={styles.logo} />
        <div className={styles.spinner} />
      </div>
    </div>
  );
}
