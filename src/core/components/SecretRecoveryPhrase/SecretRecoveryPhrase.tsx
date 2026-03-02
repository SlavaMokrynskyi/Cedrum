import React, { useState, useEffect, useMemo } from "react";
import styles from "./SecretRecoveryPhrase.module.css";
import { ReactComponent as EyeOffIcon } from "core/image/EyeOffSvg";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import { CopyAddressIconSvg } from "core/image/CopyAddressIconSvg";
import useWalletState from "core/hooks/useWalletState";
import { getSeedPhrase, decryptByVaultKey } from "core/utils/seedPhrase";
import { Cedra, CedraConfig, Account } from "@cedra-labs/ts-sdk";
import { PATH_CEDRA_COIN } from "core/constants";

export default function SecretRecoveryPhrase() {
  const [blurred, setBlurred] = useState(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const location = useLocation();
  const { password, hideElement, existingMnemonic, fromShowRecoveryPhrase } =
    location.state || {};

  const { cedraNetwork } = useWalletState();
  const client = useMemo(
    () => new Cedra(new CedraConfig({ network: cedraNetwork })),
    [cedraNetwork]
  );

  const isViewMode = !!existingMnemonic;

  const words = useMemo(() => {
    if (!seedPhrase) return null;
    return seedPhrase.trim().split(" ");
  }, [seedPhrase]);

  const handleCopy = async () => {
    if (seedPhrase) {
      try {
        await navigator.clipboard.writeText(seedPhrase);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      if (seedPhrase) {
        const account = Account.fromDerivationPath({
          path:`${PATH_CEDRA_COIN}/0'`,
          mnemonic: seedPhrase,
        });

        const response = await client.fundAccount({
          accountAddress: account.accountAddress,
          amount: 100_000_000,
        });

        if (response.success) {
          navigate("/auth/enter-recovery-phrase",{
            state: {password : password}
          });
        } else {
          console.error("Failed to fund account", response);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadSeedPhrase = async () => {
      if (isViewMode && existingMnemonic) {
        setSeedPhrase(existingMnemonic);
        return;
      }
      
      if (!isViewMode) {
        try {
          await getSeedPhrase(setSeedPhrase, cedraNetwork);
        } catch (error) {
          console.error(error);
        }
      }
    };
    
    loadSeedPhrase();
  }, [cedraNetwork, isViewMode, existingMnemonic]);

  return (
    <div className={styles.container}>
      <button
        className={styles.backButton}
        onClick={() => navigate(fromShowRecoveryPhrase ? -2 : -1)}
      >
        <ArrowLeftSvg className={styles.backIcon} />
      </button>

      <div className={styles.content}>
        <h1 className={styles.title}>Secret Recovery Phrase</h1>
        <p className={styles.warning}>
          This phrase is the ONLY way to recover your
          <br />
          wallet. Do NOT share it with anyone
        </p>

        <div className={styles.phraseGridWrapper}>
          <div className={styles.phraseGrid}>
            {words ? (
              words.map((word, index) => (
                <div key={index} className={styles.wordField}>
                  <span className={styles.wordNumber}>{index + 1}.</span>
                  <span className={blurred ? styles.wordBlur : styles.word}>{word}</span>
                </div>
              ))
            ) : (
              <div className={styles.loading}>loading</div>
            )}
          </div>
          {blurred && (
            <button
              className={styles.eyeButton}
              type="button"
              aria-label="Show phrase"
              onClick={() => setBlurred(false)}
            >
              <EyeOffIcon className={styles.eyeIcon} />
            </button>
          )}
        </div>

        <button className={styles.copyButton} onClick={handleCopy}>
          <CopyAddressIconSvg className={styles.copyIcon} />
          <span>{copied ? "Copied!" : "Copy to clipboard"}</span>
        </button>

        {!hideElement && (
          <>
            <div className={styles.checkboxContainer}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isSaved}
                  onChange={(e) => setIsSaved(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>
                  I saved my Secret Recovery Phrase
                </span>
              </label>
            </div>
            <button
              className={styles.continueButton}
              onClick={handleContinue}
              disabled={!isSaved || isLoading}
            >
              {isLoading ? "Loading..." : "Continue"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
