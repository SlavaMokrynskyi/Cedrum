import React from "react";
import styles from "./TokenSelectList.module.css";
import TokenSelectItem from "../TokenSelectItem/TokenSelectItem";

interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  icon?: string;
}

interface TokenSelectListProps {
  tokens?: Token[];
  title?: string;
}

const defaultTokens: Token[] = [
  { id: "1", name: "Solana", symbol: "SOL", balance: 70.7878 },
  { id: "2", name: "Solana", symbol: "SOL", balance: 70.7878 },
  { id: "3", name: "Solana", symbol: "SOL", balance: 70.7878 },
  { id: "4", name: "Solana", symbol: "SOL", balance: 70.7878 },
  { id: "5", name: "Solana", symbol: "SOL", balance: 70.7878 },
  { id: "6", name: "Solana", symbol: "SOL", balance: 70.7878 },
];

export default function TokenSelectList({
  tokens = defaultTokens,
  title = "Popular tokens",
}: TokenSelectListProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.list}>
        {tokens.map((token) => (
          <TokenSelectItem
            key={token.id}
            name={token.name}
            symbol={token.symbol}
            balance={token.balance}
            icon={token.icon}
          />
        ))}
      </div>
    </div>
  );
}
