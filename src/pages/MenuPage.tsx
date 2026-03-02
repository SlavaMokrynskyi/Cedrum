import React from "react";
import Menu from "core/components/Menu/Menu";
import styles from "./pages.module.css";

export default function MenuPage() {
    return (
        <div className={styles.pageContainer}>
            <Menu />
        </div>
    );
}