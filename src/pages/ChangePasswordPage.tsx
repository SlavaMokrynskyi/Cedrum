import React from "react";
import ChangePassword from "core/components/ChangePassword/ChangePassword";
import styles from "./pages.module.css";

export default function ChangePasswordPage() {
    return (
        <div className={styles.pageContainer}>
            <ChangePassword />
        </div>
    );
}