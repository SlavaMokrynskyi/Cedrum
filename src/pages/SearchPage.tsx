import React from "react";
import TopBarFeatures from "core/components/TopBarFeatures/TopBarFeatures";
import styles from "./pages.module.css";

export default function SearchPage() {
  return (
      <div className={styles.pageContainer}>
        <TopBarFeatures title="Search"/>
        <h1>Search</h1>
      </div>
  );
}
