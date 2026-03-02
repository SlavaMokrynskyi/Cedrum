import React from "react";
import ConfirmTransaction from "core/components/ConfirmTransaction/ConfirmTransaction";
import styles from "./pages.module.css";

export default function ConfirmTransactionPage() {
    return (
        <div className={styles.pageContainer}>
            <ConfirmTransaction />
        </div>
    );
}