import React from "react";
import TransactionDescription from "core/components/TransactionDescription/TransactionDescription";
import styles from "./pages.module.css";

export default function TransactionDescriptionPage() {
    return (
        <div className={styles.pageContainer}>
            <TransactionDescription />
        </div>
    );
}