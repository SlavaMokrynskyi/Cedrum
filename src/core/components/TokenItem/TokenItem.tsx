import React from "react";
import styles from "./TokenItem.module.css";

interface TokenItemProps {
  name: string;
  symbol: string;
  balance: number;
  value: number;
  changePercentage: number;
  icon?: string;
}

export default function TokenItem({
  name,
  symbol,
  balance,
  value,
  changePercentage,
  icon,
}: TokenItemProps) {
  const formattedValue = value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Format balance: show <0.01 if balance is less than 0.01
  const formattedBalance = balance < 0.01 
    ? "<0.01" 
    : balance.toLocaleString("en-US", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      });

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.icon}>
          {icon ? (
            <img src={icon} alt={name} />
          ) : (
            <div className={styles.placeholderIcon} />
          )}
        </div>
        <div className={styles.info}>
          <span className={styles.name}>{name}</span>
          <span className={styles.balance}>{formattedBalance} {symbol}</span>
        </div>
      </div>
      <div className={styles.right}>
        <span className={styles.value}>{formattedValue}</span>
        <span className={styles.change}>{changePercentage}%</span>
      </div>
    </div>
  );
}
