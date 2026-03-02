import React from "react";
import styles from "./TokenList.module.css";
import TokenItem from "../TokenItem/TokenItem";

interface Token {
  id: string;
  chain: string;
  chainId: number;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  changePercentage: number;
  icon?: string;
}

interface TokenListProps {
  tokens?: Token[];
  balance:number;
  cedraPrice:number;
}

const defaultTokens: Token[] = [
  {
    id: "1",
    chain: "cedra",
    chainId: 1,
    name: "Cedra",
    symbol: "CED",
    balance: 0,
    value: 0,
    changePercentage: 0,
  },
];

export default function TokenList({ tokens = defaultTokens,balance,cedraPrice }: TokenListProps) {
  return (
    <div className={styles.container}>
      {defaultTokens.map((token) => (
        <TokenItem
          key={token.id}
          name={token.name}
          symbol={token.symbol}
          balance={balance}
          value={balance * cedraPrice}
          changePercentage={token.changePercentage}
          icon={token.icon}
        />
      ))}
    </div>
  );
}
