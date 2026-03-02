import React from "react";
import CreatePassword from "core/components/CreatePassword/CreatePassword";
import styles from "./pages.module.css";

export default function CreatePasswordPage() {
  return (
    <div className={styles.pageContainer}>
      <CreatePassword />
    </div>
  );
}