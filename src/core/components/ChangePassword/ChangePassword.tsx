import React, { useState } from "react";
import styles from "./ChangePassword.module.css";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import { ReactComponent as EyeOffIcon } from "core/image/EyeOffSvg";
import { ReactComponent as EyeIcon } from "core/image/EyeSvg";
import { useNavigate } from "react-router-dom";
import { checkPasswordByDecrypt, decryptMnemonic, setMnemonicVault } from "core/utils/seedPhrase";
import { unlockSession } from "core/utils/lock";

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "At least one letter", test: (p) => /[A-Za-z]/.test(p) },
  { label: "At least one number", test: (p) => /\d/.test(p) },
  { label: "At least one special character (@$!%*#?&)", test: (p) => /[@$!%*#?&]/.test(p) },
];

export default function ChangePassword() {
    const navigate = useNavigate();
    
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [verifyPassword, setVerifyPassword] = useState("");
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showVerifyPassword, setShowVerifyPassword] = useState(false);

    const newPasswordValue = newPassword || "";
    const verifyPasswordValue = verifyPassword || "";
    
    const metRequirements = passwordRequirements.map((req) => ({
        ...req,
        met: req.test(newPasswordValue),
    }));
    
    const allRequirementsMet = metRequirements.every((r) => r.met);
    const passwordsMatch = newPasswordValue === verifyPasswordValue && newPasswordValue.length > 0;
    
    const isValid = currentPassword.length > 0 && allRequirementsMet && passwordsMatch;

    const handleSave = async () => {
        if (!currentPassword || !newPassword || !verifyPassword) {
            setMessage({ text: "Please fill in all fields", type: "error" });
            return;
        }

        if (newPassword !== verifyPassword) {
            setMessage({ text: "New passwords do not match", type: "error" });
            return;
        }

        if (newPassword.length < 8) {
            setMessage({ text: "Password must be at least 8 characters", type: "error" });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const isValidCurrent = await checkPasswordByDecrypt(currentPassword);
              if (!isValidCurrent) {
                setMessage({ text: "Current Password is incorrect, try again", type: "error" });
                return;
            }
            const DecryptedPhrase = await decryptMnemonic(currentPassword)
            await setMnemonicVault(DecryptedPhrase,newPassword!);
            await unlockSession(newPassword!);

            setMessage({ text: "Password changed successfully!", type: "success" });
            setCurrentPassword("");
            setNewPassword("");
            setVerifyPassword("");
            setTimeout(() => {
                navigate(-1);
            }, 2000);
        } catch (error) {
            console.error("Error changing password:", error);
            setMessage({ text: "Failed to change password. Please try again.", type: "error" });
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
                <h1 className={styles.title}>Change password</h1>

                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}
                <div className={styles.inputBlocks}>
                    <div className={styles.inputBlock}>
                        <div className={styles.inputRow}>
                            <span className={styles.inputLabel}>Current</span>
                            <div className={styles.passwordField}>
                                <input
                                    className={styles.passwordInput}
                                    type={showCurrentPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                                >
                                    {showCurrentPassword ? <EyeIcon className={styles.eyeIcon} /> : <EyeOffIcon className={styles.eyeIcon} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.inputBlock}>
                        <div className={styles.inputRow}>
                            <span className={styles.inputLabel}>New</span>
                            <div className={styles.passwordField}>
                                <input
                                    className={styles.passwordInput}
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                                >
                                    {showNewPassword ? <EyeIcon className={styles.eyeIcon} /> : <EyeOffIcon className={styles.eyeIcon} />}
                                </button>
                            </div>
                        </div>
                        
                        {newPasswordValue.length > 0 && (
                            <div className={styles.requirementsList}>
                                {metRequirements.map((req, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.requirement} ${req.met ? styles.requirementMet : ""}`}
                                    >
                                        <span className={styles.requirementIcon}>
                                            {req.met ? "✓" : "○"}
                                        </span>
                                        <span>{req.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className={styles.divider} />
                        <div className={styles.inputRow}>
                            <span className={styles.inputLabel}>Verify</span>
                            <div className={styles.passwordField}>
                                <input
                                    className={styles.passwordInput}
                                    type={showVerifyPassword ? "text" : "password"}
                                    placeholder="Re-enter password"
                                    value={verifyPassword}
                                    onChange={(e) => setVerifyPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                                    aria-label={showVerifyPassword ? "Hide password" : "Show password"}
                                >
                                    {showVerifyPassword ? <EyeIcon className={styles.eyeIcon} /> : <EyeOffIcon className={styles.eyeIcon} />}
                                </button>
                            </div>
                        </div>
                        
                        {verifyPasswordValue.length > 0 && !passwordsMatch && (
                            <span className={styles.matchError}>Passwords do not match</span>
                        )}
                    </div>
                </div>
            </div>

            <button 
                className={styles.saveButton} 
                onClick={handleSave}
                disabled={isLoading || !isValid}
            >
                {isLoading ? "Saving..." : "Save"}
            </button>
        </div>
    );
}
