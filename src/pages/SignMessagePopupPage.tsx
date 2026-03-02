import React, { useEffect } from "react";
import SignMessagePopup from "core/components/SignMessagePopup/SignMessagePopup";
import styles from "./pages.module.css";
import { enableWindowFlowSizing } from "./windowFlowSizing";


export default function SignMessagePopupPage() {
    useEffect(() => {
        const restoreWindowFlowSizing = enableWindowFlowSizing();
        return restoreWindowFlowSizing;
    }, []);

    return (
        <div className={styles.pageContainer}>
            <SignMessagePopup/>
        </div>
    );
}
