import React from "react";
import NFTDescription from "core/components/NFTDescription/NFTDescription";
import styles from "./pages.module.css";

export default function NFTDescriptionPage() {
    return (
        <div className={styles.pageContainer}>
            <NFTDescription/>
        </div>
    );
}