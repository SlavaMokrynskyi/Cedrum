import React from "react";
import Success from "core/components/Success/Success";
import styles from "./pages.module.css";

export default function SuccessPage() {
    return (
        <div className={styles.pageContainer}>
            <Success />
        </div>
    );
}