import React, { useEffect, useState } from "react";
import styles from "./AccountBalanceInfo.module.css";

interface Props{
  balance: Number;
  dailyChange: number;
  dailyPercentage: number;
}

export default function AccountBalanceInfo({balance,dailyChange,dailyPercentage} : Props) {
  const[isPositive, setIsPositive] = useState<boolean>(true);

  console.log(balance, " type : ", typeof(balance))

  useEffect(()=>{
    setIsPositive(dailyChange >= 0)
  },[dailyChange])

  return (
    <div className={styles.container}>
      <div className={styles.balance}>
        ${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className={styles.changes}>
        <span className={isPositive ? styles.positiveChange : styles.negativeChange}>
          {isPositive ? "+" : "-"}${Math.abs(dailyChange).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className={isPositive ? styles.positiveBadge : styles.negativeBadge}>
          {isPositive ? "+" : ""}{dailyPercentage}%
        </span>
      </div>
    </div>
  );
}
