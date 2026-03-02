import React, { useEffect, useState } from "react";
import styles from "./Language.module.css";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import { InfoIconSvg } from "core/image/InfoIconSvg";
import { useNavigate } from "react-router-dom";
import { DEFAULT_LANGUAGE } from "core/constants";
import useWalletState from "core/hooks/useWalletState";

interface LanguageOption {
  name: string;
  nativeName: string;
  shortName: string;
}

const languageOptions: LanguageOption[] = [
  {
    name: DEFAULT_LANGUAGE.name,
    nativeName: DEFAULT_LANGUAGE.name,
    shortName: DEFAULT_LANGUAGE.shortName,
  },
];

export default function Language() {
  const navigate = useNavigate();
  const { language, updateLanguage } = useWalletState();
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE.shortName);
  const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_LANGUAGE.shortName);

  useEffect(() => {
    const nextLanguage = language?.shortName || DEFAULT_LANGUAGE.shortName;
    setCurrentLanguage(nextLanguage);
    setSelectedLanguage(nextLanguage);
  }, [language]);

  const handleLanguageSelect = (shortName: string) => {
    setSelectedLanguage(shortName);
  };

  const handleContinue = () => {
    const nextLanguage =
      languageOptions.find((item) => item.shortName === selectedLanguage) ||
      languageOptions[0];

    updateLanguage({
      name: nextLanguage.name,
      shortName: nextLanguage.shortName,
    });
    setCurrentLanguage(nextLanguage.shortName);
    navigate(-1);
  };

  const isContinueDisabled = selectedLanguage === currentLanguage;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => navigate(-1)}
          type="button"
        >
          <ArrowLeftSvg className={styles.icon} />
        </button>
        <h1 className={styles.title}>Language</h1>
        <button className={styles.infoButton} type="button">
          <InfoIconSvg className={styles.icon} />
        </button>
      </div>

      <div className={styles.languagesList}>
        {languageOptions.map((lang) => (
          <button
            key={lang.shortName}
            className={`${styles.languageItem} ${selectedLanguage === lang.shortName ? styles.selected : ""}`}
            onClick={() => handleLanguageSelect(lang.shortName)}
            type="button"
          >
            <span className={styles.languageName}>{lang.nativeName}</span>
            {selectedLanguage === lang.shortName && (
              <span className={styles.checkmark}>
                {String.fromCharCode(10003)}
              </span>
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
