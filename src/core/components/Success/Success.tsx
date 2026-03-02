import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Success.module.css";

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="9 12 12 15 16 10"/>
  </svg>
);

export default function Success() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/wallet/portfolio");
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <CheckIcon />
        </div>
        <h1 className={styles.title}>Success</h1>
      </div>
      <div className={styles.footer}>
        <button
          className={styles.continueButton}
          onClick={handleContinue}
          type="button"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
