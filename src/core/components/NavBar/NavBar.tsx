import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from './NavBar.module.css'

import { PortfolioIconSvg } from "core/image/PortfolioIconSvg";
import { NFTIconSvg } from "core/image/NFTIconSvg";
import { ClockIconSvg } from "core/image/ClockIconSvg";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path;

  return (
    <nav className={styles.navbar}>
      <button
        className={`${styles.item} ${
          isActive("/wallet/portfolio") ? styles.itemActive : ""
        }`}
        onClick={() => navigate("/wallet/portfolio")}
      >
        <span className={styles.iconWrap}>
          <PortfolioIconSvg className={styles.icon} />
        </span>
        <span>Portfolio</span>
      </button>

      <button
        className={`${styles.item} ${
          isActive("/wallet/nft") ? styles.itemActive : ""
        }`}
        onClick={() => navigate("/wallet/nft")}
      >
        <span className={styles.iconWrap}>
          <NFTIconSvg className={styles.icon} />
        </span>
        <span>NFTs</span>
      </button>

      <button
        className={`${styles.item} ${
          isActive("/wallet/transactions") ? styles.itemActive : ""
        }`}
        onClick={() => navigate("/wallet/transactions")}
      >
        <span className={styles.iconWrap}>
          <ClockIconSvg className={styles.icon} />
        </span>
        <span className={styles.itemText}>Activity</span>
      </button>
    </nav>
  ); 
}
