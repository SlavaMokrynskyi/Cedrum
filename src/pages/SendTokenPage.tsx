import React from "react";
import SendToken from "core/components/SendToken/SendToken";
import styles from "./pages.module.css";

export default function SendTokenPage() {
    return (
        <div className={styles.pageContainer}>
            <SendToken />
        </div>
    );
}