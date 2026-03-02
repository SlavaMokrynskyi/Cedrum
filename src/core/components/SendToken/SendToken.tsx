import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./SendToken.module.css";
import SelectTokenTopBar from "core/components/SelectTokenTopBar/SelectTokenTopBar";
import useWalletState from "core/hooks/useWalletState";
import { getAccountBalance } from "core/utils/helper";

interface ValidationErrors {
  address?: string;
  amount?: string;
}

export default function SendToken() {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [tokenBalance, setTokenBalance] = useState<string>("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const navigate = useNavigate();
  const location = useLocation();
  const { cedraAccount, cedraNetwork } = useWalletState();

  const { symbol } = location.state as { symbol: string };

  const balance = parseFloat(tokenBalance) || 0;

  const validateAddress = (addr: string): string | undefined => {
    if (!addr) return "Address is required";
    if (!addr.startsWith("0x")) return "Address must start with 0x";
    if (addr.length !== 66) return "Address must be 66 characters long";
    return undefined;
  };

  const validateAmount = (amt: string): string | undefined => {
    if (!amt) return "Amount is required";
    const num = parseFloat(amt);
    if (isNaN(num) || num <= 0) return "Amount must be greater than 0";
    if (num > balance) return "Amount exceeds balance";
    return undefined;
  };

  const isValid = !validateAddress(address) && !validateAmount(amount);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    setErrors(prev => ({ ...prev, address: validateAddress(value) }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setErrors(prev => ({ ...prev, amount: validateAmount(value) }));
    }
  };

  const handleContinue = () => {
    const addressError = validateAddress(address);
    const amountError = validateAmount(amount);
    setErrors({ address: addressError, amount: amountError });
    if (addressError || amountError) {
      return;
    }

    navigate("/wallet/confirm-transaction", {
      state: { amount: amount, to: address, symbol: symbol },
    });
  };

  useEffect(() => {
    const getData = async () => {
      if (cedraAccount?.accountAddress) {
        const balance = await getAccountBalance(
          cedraAccount?.accountAddress,
          cedraNetwork,
        );
        setTokenBalance((balance / 100_000_000).toFixed(7));
      }
    };
    getData();
  }, [cedraAccount?.accountAddress, cedraNetwork]);

  return (
    <div className={styles.container}>
      <SelectTokenTopBar title="Send" onBack={() => navigate(-1)} />
      <div className={styles.content}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Enter address</label>
          <div className={`${styles.inputWrapper} ${errors.address ? styles.inputError : ""}`}>
            <input
              type="text"
              className={styles.input}
              placeholder="0x..."
              value={address}
              onChange={handleAddressChange}
            />
          </div>
          {errors.address && (
            <span className={styles.errorText}>{errors.address}</span>
          )}
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Enter amount:</label>
          <div className={`${styles.inputWrapper} ${errors.amount ? styles.inputError : ""}`}>
            <input
              type="text"
              inputMode="decimal"
              className={styles.input}
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
            />
          </div>
          {errors.amount && (
            <span className={styles.errorText}>{errors.amount}</span>
          )}
          <span className={styles.balance}>
            Balance: {tokenBalance} {symbol}
          </span>
        </div>
      </div>
      <div className={styles.footer}>
        <button
          className={styles.continueButton}
          onClick={handleContinue}
          type="button"
          disabled={!isValid}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
