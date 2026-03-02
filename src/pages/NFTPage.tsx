import React from "react";
import NFT from "core/components/NFT/NFT";
import styles from "./pages.module.css";

export default function NFTPage() {
  return (
      <div className={styles.pageContainer}>
        <NFT/>
      </div>
  );
}
