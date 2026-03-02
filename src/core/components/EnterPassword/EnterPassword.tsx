import React, { useState } from "react";
import styles from "./EnterPassword.module.css";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import { ReactComponent as EyeOffIcon } from "core/image/EyeOffSvg";
import { ReactComponent as EyeIcon } from "core/image/EyeSvg";
import { useLocation, useNavigate } from "react-router-dom";
import { checkPasswordByDecrypt, decryptByVaultKey } from "core/utils/seedPhrase";

export default function EnterPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const fromShowRecoveryPhrase = location.state?.fromShowRecoveryPhrase === true;
    
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleVerify = async () => {
        if (!password) {
            setMessage({ text: "Please enter your password", type: "error" });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const isValid = await checkPasswordByDecrypt(password);
            
            if (isValid) {
                const mnemonic = await decryptByVaultKey();
                navigate("/auth/recovery-phrase", { 
                    state: { 
                        hideElement: true,
                        existingMnemonic: mnemonic,
                        fromShowRecoveryPhrase,
                    } 
                });
            } else {
                setMessage({ text: "Invalid password. Please try again.", type: "error" });
            }
        } catch (error) {
            console.error("Error verifying password:", error);
            setMessage({ text: "Invalid password. Please try again.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
                <ArrowLeftSvg className={styles.backIcon} />
            </button>

            <div className={styles.content}>
                <h1 className={styles.title}>Enter Password</h1>
                <p className={styles.description}>
                    Please enter your password to view your Secret Recovery Phrase
                </p>

                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <div className={styles.inputBlock}>
                    <div className={styles.inputRow}>
                        <span className={styles.inputLabel}>Password</span>
                        <div className={styles.passwordField}>
                            <input
                                className={styles.passwordInput}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleVerify();
                                    }
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
                    </div>
                </div>
                <button 
                    className={styles.submitButton} 
                    onClick={handleVerify}
                    disabled={isLoading}
                >
                    {isLoading ? "Verifying..." : "Continue"}
                </button>
            </div>
        </div>
    );
}
