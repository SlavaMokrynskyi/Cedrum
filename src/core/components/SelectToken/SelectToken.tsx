import React, { useState, useMemo } from "react";
import styles from "./SelectToken.module.css";
import SelectTokenTopBar from "core/components/SelectTokenTopBar/SelectTokenTopBar";
import SearchInput from "core/components/SearchInput/SearchInput";
import TokenSelectList from "core/components/TokenSelectList/TokenSelectList";
import NavBar from "core/components/NavBar/NavBar";

interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  icon?: string;
}

const defaultTokens: Token[] = [
  { id: "1", name: "Solana", symbol: "SOL", balance: 70.7878 },
  { id: "2", name: "Solana", symbol: "SOL", balance: 70.7878 },
  { id: "3", name: "Solana", symbol: "SOL", balance: 70.7878 },
  { id: "4", name: "Solana", symbol: "SOL", balance: 70.7878 },
  { id: "5", name: "Solana", symbol: "SOL", balance: 70.7878 },
  { id: "6", name: "Solana", symbol: "SOL", balance: 70.7878 },
];

export default function SelectToken() {
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

  return (
    <div className={styles.container}>
      <SelectTokenTopBar />
      <SearchInput
        placeholder="Search"
        value={searchQuery}
        onChange={setSearchQuery}
      />
      <div className={styles.content}>
        <TokenSelectList tokens={filteredTokens} />
      </div>
      <NavBar />
    </div>
  );
}
