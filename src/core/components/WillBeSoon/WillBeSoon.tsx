import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./WillBeSoon.module.css";

export default function WillBeSoon() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <button
        onClick={() => navigate("/wallet/portfolio")}
        className={styles.backButton}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 className={styles.title}>Coming Soon</h1>
      <p className={styles.description}>This feature will be available soon</p>
    </div>
  );
}
