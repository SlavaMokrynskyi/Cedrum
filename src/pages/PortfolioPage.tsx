import React from "react";
import PortfolioBody from "core/components/PortfolioBody/PortfolioBody";
import styles from "./pages.module.css";

export default function PortfolioPage() {
  return (
    <div className={styles.pageContainer}>
      <PortfolioBody/>
    </div>
  ); 
}
