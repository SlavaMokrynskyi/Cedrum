import React from "react";
import styles from "./TokenSelectItem.module.css";

interface TokenSelectItemProps {
  name: string;
  symbol: string;
  balance: number;
  balanceLabel?: string;
  icon?: string;
  onClick?: () => void;
}

export default function TokenSelectItem({
  name,
  symbol,
  balance,
  balanceLabel,
  icon,
  onClick,
}: TokenSelectItemProps) {
  const formattedBalance = balanceLabel || (balance < 0.01
    ? "<0.01"
    : balance.toLocaleString("en-US", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }));

  return (
    <div className={styles.container} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.icon}>
        {icon ? (
          <img src={icon} alt={name} />
        ) : (
          <div className={styles.placeholderIcon} />
        )}
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={balanceLabel ? styles.balanceLabel : styles.balance}>{formattedBalance}</span>
      </div>
    </div>
  );
}
