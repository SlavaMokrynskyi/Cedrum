import React from "react";
import Settings from "core/components/Settings/Settings";
import styles from "./pages.module.css";

export default function SettingsPage() {
    return (
        <div className={styles.pageContainer}>
            <Settings />
        </div>
    );
}