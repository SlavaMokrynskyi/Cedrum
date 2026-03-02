import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SelectTokenTopBar.module.css";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import { InfoIconSvg } from "core/image/InfoIconSvg";

interface SelectTokenTopBarProps {
  title?: string;
  onBack?: () => void;
}

export default function SelectTokenTopBar({ title = "Select token", onBack }: SelectTokenTopBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.backButton}
        onClick={handleBack}
        type="button"
        aria-label="Go back"
      >
        <ArrowLeftSvg className={styles.backIcon} />
      </button>
      <h1 className={styles.title}>{title}</h1>
      <button
        className={styles.infoButton}
        type="button"
        aria-label="Information"
      >
        <InfoIconSvg className={styles.infoIcon} />
      </button>
    </div>
  );
}
