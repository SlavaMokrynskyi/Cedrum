import React from "react";
import PageIsLoading from "core/components/PageIsLoading/PageIsLoading";
import styles from "./pages.module.css";

export default function PageIsLoadingPage() {
  return (
      <div className={styles.pageContainer}>
        <PageIsLoading/>
      </div>
  );
}
