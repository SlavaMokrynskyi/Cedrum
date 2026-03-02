import React from "react";
import styles from "./MyAccount.module.css";
import { useNavigate } from "react-router-dom";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import { ArrowRightSvg } from "core/image/ArrowRightSvg";

export default function MyAccount() {
    const navigate = useNavigate();

    const menuItems = [
        { label: "Change password", path: "/wallet/settings/change-password" },
        {
            label: "Show Secret Recovery Phrase",
            path: "/auth/enter-password",
            state: { fromShowRecoveryPhrase: true },
        },
        { label: "Log out", path: "/wallet/logout", isDanger: true }
    ];

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
                <ArrowLeftSvg className={styles.backIcon} />
            </button>

            <h1 className={styles.title}>My Account</h1>

            <div className={styles.menu}>
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        className={`${styles.menuItem} ${item.isDanger ? styles.danger : ""}`}
                        onClick={() => navigate(item.path, item.state ? { state: item.state } : undefined)}
                    >
                        <span className={styles.menuLabel}>{item.label}</span>
                        <ArrowRightSvg className={styles.chevron} />
                    </button>
                ))}
            </div>
        </div>
    );
}
