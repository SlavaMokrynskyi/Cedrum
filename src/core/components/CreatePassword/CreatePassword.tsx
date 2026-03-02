import React, { useState } from "react";
import styles from "./CreatePassword.module.css";
import { CedrumLogoSvg } from "core/image/CedrumLogoSvg";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import { ReactComponent as EyeOffIcon } from "core/image/EyeOffSvg";
import { ReactComponent as EyeIcon } from "core/image/EyeSvg";
import { useLocation, useNavigate } from "react-router-dom";
import useWalletState from "core/hooks/useWalletState";
import { unlockSession } from "core/utils/lock";
import { Account, Ed25519PrivateKey } from "@cedra-labs/ts-sdk";
import { PATH_CEDRA_COIN } from "core/constants";
import { setMnemonicVault } from "core/utils/seedPhrase";
import { closeFullscreenExtensionView } from "core/utils/extensionView";

type LocationState = { privateKey: string; recoveryPhrase: string };

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "At least one letter", test: (p) => /[A-Za-z]/.test(p) },
  { label: "At least one number", test: (p) => /\d/.test(p) },
  {
    label: "At least one special character (@$!%*#?&)",
    test: (p) => /[@$!%*#?&]/.test(p),
  },
];

export default function CreatePassword() {
  const [password, setPassword] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { createWalletState } = useWalletState();

  const state = location.state as LocationState | null;

  const privateKey = state?.privateKey;
  const recoveryPhrase = state?.recoveryPhrase;

  const passwordValue = password || "";
  const confirmPasswordValue = confirmPassword || "";

  const metRequirements = passwordRequirements.map((req) => ({
    ...req,
    met: req.test(passwordValue),
  }));

  const allRequirementsMet = metRequirements.every((r) => r.met);
  const passwordsMatch =
    passwordValue === confirmPasswordValue && passwordValue.length > 0;

  const isValid = allRequirementsMet && passwordsMatch;

  const passwordOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const confirmPasswordOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const finishRegistration = async () => {
    const isClosed = await closeFullscreenExtensionView();

    if (isClosed) {
      return;
    }

    navigate("/wallet/portfolio", { replace: true });
  };

  const handleNextStep = async () => {
    if (!isValid) return;

    try {
      if (privateKey && recoveryPhrase) {
        const ed25519PrivateKey = new Ed25519PrivateKey(privateKey);
        const account = Account.fromPrivateKey({
          privateKey: ed25519PrivateKey,
        });

        await createWalletState({
          account,
          path: `${PATH_CEDRA_COIN}/0'`,
          walletName: null,
        });
        await setMnemonicVault(recoveryPhrase, password!);
        await unlockSession(password!);
        await finishRegistration();
      } else {
        navigate("/auth/recovery-phrase", {
          state: {
            password,
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <ArrowLeftSvg className={styles.backIcon} />
      </button>

      <div className={styles.content}>
        <CedrumLogoSvg className={styles.logo} />
        <h1 className={styles.title}>Create a password</h1>
        <h2 className={styles.subtitle}>
          You will use this to unlock your wallet
        </h2>

        <div className={styles.inputGroup}>
          <div className={styles.passwordField}>
            <input
              className={styles.passwordInput}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password || ""}
              onChange={passwordOnChange}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeIcon className={styles.eyeIcon} />
              ) : (
                <EyeOffIcon className={styles.eyeIcon} />
              )}
            </button>
          </div>

          {passwordValue.length > 0 && (
            <div className={styles.requirementsList}>
              {metRequirements.map((req, index) => (
                <div
                  key={index}
                  className={`${styles.requirement} ${req.met ? styles.requirementMet : ""}`}
                >
                  <span className={styles.requirementIcon}>
                    {String.fromCharCode(req.met ? 10003 : 9675)}
                  </span>
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.passwordField}>
            <input
              className={styles.passwordInput}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword || ""}
              onChange={confirmPasswordOnChange}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeIcon className={styles.eyeIcon} />
              ) : (
                <EyeOffIcon className={styles.eyeIcon} />
              )}
            </button>
          </div>

          {confirmPasswordValue.length > 0 && !passwordsMatch && (
            <span className={styles.matchError}>Passwords do not match</span>
          )}
        </div>
      </div>

      <button
        className={styles.continueButton}
        onClick={handleNextStep}
        disabled={!isValid}
      >
        Continue
      </button>
    </div>
  );
}
