import React from "react";
import RegistrationLogin from "core/components/RegistrationLogin/RegistrationLogin";
import styles from "./pages.module.css";

export default function RegistrationLoginPage() {
    return (
        <div className={styles.pageContainer}>
            <RegistrationLogin />
        </div>
    );
}