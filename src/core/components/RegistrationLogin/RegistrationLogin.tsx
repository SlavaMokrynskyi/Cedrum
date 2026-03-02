import React from "react";
import styles from "./RegistrationLogin.module.css";
import { CedrumLogoSvg } from "core/image/CedrumLogoSvg";
import { useNavigate } from "react-router-dom";

export default function RegistrationLogin() {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.logoSection}>
                <CedrumLogoSvg className={styles.logo}/>
                <h1 className={styles.title}>Cedrum</h1>
            </div>
            <div className={styles.buttonGroup}>
                <button className={styles.createWalletButton} onClick={() => navigate("/wallet/create-password")}>
                    Create a new wallet
                </button>
                <button className={styles.importWalletButton} onClick={() => navigate("/auth/enter-recovery-phrase")}>
                    Import wallet
                </button>
            </div>
        </div>
    );
}