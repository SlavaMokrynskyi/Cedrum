import React, { useState } from "react";
import styles from "./SearchInput.module.css";
import { SearchIconSvg } from "core/image/SearchIconSvg";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function SearchInput({
  placeholder = "Search",
  value,
  onChange,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={value !== undefined ? value : internalValue}
          onChange={handleChange}
        />
        <SearchIconSvg className={styles.icon} />
      </div>
    </div>
  );
}
