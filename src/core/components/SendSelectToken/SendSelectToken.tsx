import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SendSelectToken.module.css";
import SelectTokenTopBar from "core/components/SelectTokenTopBar/SelectTokenTopBar";
import SearchInput from "core/components/SearchInput/SearchInput";
import TokenSelectItem from "core/components/TokenSelectItem/TokenSelectItem";
import NavBar from "core/components/NavBar/NavBar";
import {
  DEFAULT_TOKEN_ID,
  DEFAULT_TOKEN_NAME,
  DEFAULT_TOKEN_SYMBOL,
} from "core/constants";

interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  balanceLabel?: string;
  icon?: string;
}

const defaultTokens: Token[] = [
  {
    id: DEFAULT_TOKEN_ID,
    name: DEFAULT_TOKEN_NAME,
    symbol: DEFAULT_TOKEN_SYMBOL,
    balance: 0,
  },
];

export default function SendSelectToken() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return defaultTokens;
    const query = searchQuery.toLowerCase();
    return defaultTokens.filter(
      (token) =>
        token.name.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleTokenClick = (symbol: string) => {
    navigate("/wallet/send-token", {
      state: {
        symbol,
      },
    });
  };

  return (
    <div className={styles.container}>
      <SelectTokenTopBar title="Select token" />
      <SearchInput
        placeholder="Search"
        value={searchQuery}
        onChange={setSearchQuery}
      />
      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>Your tokens</h2>
        <div className={styles.tokenList}>
          {filteredTokens.map((token) => (
            <TokenSelectItem
              key={token.id}
              name={token.name}
              symbol={token.symbol}
              balance={token.balance}
              balanceLabel={token.balanceLabel}
              icon={token.icon}
              onClick={() => handleTokenClick(token.symbol)}
            />
          ))}
        </div>
      </div>
      <NavBar />
    </div>
  );
}
