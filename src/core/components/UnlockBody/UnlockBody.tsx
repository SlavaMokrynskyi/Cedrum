import React, { useState } from "react";
import styles from "./UnlockBody.module.css";
import { CedrumLogoSvg } from "core/image/CedrumLogoSvg";
import { ReactComponent as EyeOffIcon } from "core/image/EyeOffSvg";
import { ReactComponent as EyeIcon } from "core/image/EyeSvg";
import { useNavigate } from "react-router-dom";
import { checkPasswordByDecrypt } from "core/utils/seedPhrase";
import { unlockSession } from "core/utils/lock";
import { MessageMethod } from "core/types";
import { useToast } from "@chakra-ui/react";

export default function UnlockBody() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast()

  const navigate = useNavigate();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return;

    setError(null);
    const isValid = await checkPasswordByDecrypt(password);

    if (isValid) {
      await unlockSession(password);

      const searchParams = new URLSearchParams(window.location.search);
      const requestId = Number(searchParams.get("id"));
      const unlockRequested = searchParams.get("unlock") === "true";

      if (unlockRequested && Number.isFinite(requestId)) {
        await chrome.runtime.sendMessage({
          method: MessageMethod.UNLOCK_AND_CONTINUE,
          id: requestId,
          data: { success: true },
        });

        window.close();
        return;
      }

      navigate("/wallet/portfolio");
    } else {
      setError("Invalid password");
      toast({
        title: "Invalid password",
        description: "Please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logoSection}>
        <CedrumLogoSvg className={styles.logo} />
        <h1 className={styles.title}>Cedrum</h1>
      </div>

      <form className={styles.formGroup} onSubmit={handleUnlock}>
        <div className={`${styles.passwordField} ${error ? styles.passwordFieldError : ""}`}>
          <input
            id="passwordField"
            type={showPassword ? "text" : "password"}
            className={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
            }}
          />
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeIcon className={styles.eyeIcon} /> : <EyeOffIcon className={styles.eyeIcon} />}
          </button>
        </div>
        {error && <span className={styles.errorText}>{error}</span>}

        <button
          className={styles.unlcokWalletButton}
          type="submit"
          disabled={password.length < 8}
        >
          Unlock
        </button>

        <button
          type="button"
          className={styles.forgotPassword}
          disabled
          hidden
        >
          Forgot password
        </button>
      </form>
    </div>
  );
}
