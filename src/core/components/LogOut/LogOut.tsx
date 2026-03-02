import React from "react";
import styles from "./LogOut.module.css";
import { CedrumLogoSvg } from "core/image/CedrumLogoSvg";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import { useNavigate } from "react-router-dom";
import useWalletState from "core/hooks/useWalletState";

export default function LogOut() {
    const navigate = useNavigate();
    const { signOut } = useWalletState()

    const handleOnClick = async () => {
        await signOut();
        navigate("/")
    }

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
                <ArrowLeftSvg className={styles.backIcon} />
            </button>

            <h1 className={styles.title}>Log out account 1</h1>
            <CedrumLogoSvg className={styles.logo} />
            <p className={styles.description}>
                This will remove all the wallets you have created or imported. Make sure you have your existing secret recovery phrase and private keys saved.
            </p>
            <div className={styles.buttonGroup}>
                <button
                    className={styles.showPhraseButton}
                    onClick={() =>
                        navigate("/auth/enter-password", {
                            state: { hideElement: true, fromShowRecoveryPhrase: true },
                        })
                    }
                >
                    Show Secret Recovery Phrase
                </button>
                <button className={styles.logOutButton} onClick={handleOnClick}>
                    Log out
                </button>
            </div>
        </div>
    );
}
