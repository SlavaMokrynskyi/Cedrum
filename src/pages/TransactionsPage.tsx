import React from "react";
import Transactions from "core/components/Transactions/Transactions";
import styles from "./pages.module.css";

export default function TransactionsPage() {
    return (
        <div className={styles.pageContainer}>
            <Transactions />
        </div>
    );
}