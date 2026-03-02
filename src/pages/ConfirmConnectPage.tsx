import React, { useEffect } from "react";
import ConfirmConnect from "core/components/ConfirmConnect/ConfirmConnect";
import styles from "./pages.module.css";
import { enableWindowFlowSizing } from "./windowFlowSizing";


export default function ConfirmConnectPage() {
    useEffect(() => {
        const restoreWindowFlowSizing = enableWindowFlowSizing();
        const resizeTimer = setTimeout(() => {
            const contentHeight = document.body.scrollHeight;
            const windowHeight = window.innerHeight;
            if (contentHeight > windowHeight - 40) {
                // eslint-disable-next-line no-undef
                chrome.windows.getCurrent((win) => {
                    if (win.id) {
                        // eslint-disable-next-line no-undef
                        chrome.windows.update(win.id, {
                            height: Math.min(contentHeight + 60, 800)
                        });
                    }
                });
            }
        }, 100);
        return () => {
            clearTimeout(resizeTimer);
            restoreWindowFlowSizing();
        };
    }, []);

    return (
        <div className={styles.pageContainer}>
            <ConfirmConnect />
        </div>
    );
}
