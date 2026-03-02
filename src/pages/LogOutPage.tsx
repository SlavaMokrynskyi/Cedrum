import React from "react";
import LogOut from "core/components/LogOut/LogOut";
import styles from "./pages.module.css";

export default function LogOutPage() {
  return (
    <div className={styles.pageContainer}>
      <LogOut />
    </div>
  );
}