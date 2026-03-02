import React, { useState, useEffect } from "react";
import styles from "./Language.module.css";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import { InfoIconSvg } from "core/image/InfoIconSvg";
import { useNavigate } from "react-router-dom";

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

const languages: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
];

const LANGUAGE_STORAGE_KEY = "cedrum-language";

export default function Language() {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
  };

  const handleContinue = () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage);
    setCurrentLanguage(selectedLanguage);
    console.log("Language saved:", selectedLanguage);
    navigate(-1);
  };

  const isContinueDisabled = selectedLanguage === currentLanguage;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeftSvg className={styles.icon} />
        </button>
        <h1 className={styles.title}>Language</h1>
        <button className={styles.infoButton}>
          <InfoIconSvg className={styles.icon} />
        </button>
      </div>

      <div className={styles.languagesList}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`${styles.languageItem} ${selectedLanguage === lang.code ? styles.selected : ""}`}
            onClick={() => handleLanguageSelect(lang.code)}
          >
            <span className={styles.languageName}>{lang.nativeName}</span>
            {selectedLanguage === lang.code && (
              <span className={styles.checkmark}>✓</span>
            )}
          </button>
        ))}
      </div>

      <button 
        className={`${styles.continueButton} ${isContinueDisabled ? styles.disabled : ""}`}
        onClick={handleContinue}
        disabled={isContinueDisabled}
      >
        Continue
      </button>
    </div>
  );
}
