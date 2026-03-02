import React, { useEffect } from "react";
import SignTxnPopup from "core/components/SignTxnPopup/SignTxnPopup";
import styles from "./pages.module.css";
import { enableWindowFlowSizing } from "./windowFlowSizing";

export default function SignTxnPopupPage() {
    useEffect(() => {
        const restoreWindowFlowSizing = enableWindowFlowSizing();
        return restoreWindowFlowSizing;
    }, []);

    return (
        <div className={styles.pageContainer}>
            <SignTxnPopup />
        </div>
    );
}
