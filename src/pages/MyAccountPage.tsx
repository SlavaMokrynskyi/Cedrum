import React from "react";
import MyAccount from "core/components/MyAccount/MyAccount";
import styles from "./pages.module.css";

export default function MyAccountPage() {
  return (
    <div className={styles.pageContainer}>
      <MyAccount />
    </div>
  );
}