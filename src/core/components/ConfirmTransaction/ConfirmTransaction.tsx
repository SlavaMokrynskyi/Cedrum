import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ConfirmTransaction.module.css";
import SelectTokenTopBar from "core/components/SelectTokenTopBar/SelectTokenTopBar";
import { shortenAddress } from "core/utils/helper";
import {
  sendCoinTransaction,
  simulateTransaction,
} from "core/mutations/transaction";
import useWalletState from "core/hooks/useWalletState";
import {
  Account,
  AccountAddress,
  Ed25519Account,
  UserTransactionResponse,
} from "@cedra-labs/ts-sdk";

export default function ConfirmTransaction() {
  const [simulatedTxn, setSimulatedTxn] =
    useState<UserTransactionResponse | null>(null);
  const [account, setAccount] = useState<Ed25519Account | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { cedraAccount, cedraNetwork } = useWalletState();

  const { amount, to, symbol } = location.state as {
    amount: number;
    to: string;
    symbol: string;
  };

  useEffect(() => {
    const getData = async () => {
      if (cedraAccount?.privateKey) {
        try {
          setError(null);
          const fromAccount = Account.fromPrivateKey({
            privateKey: cedraAccount.privateKey,
          });
          const simulatedTxn = await simulateTransaction({
            fromAccount: fromAccount,
            nodeUrl: cedraNetwork,
            entryFunctionPayload: {
              function: "0x1::cedra_account::transfer",
              functionArguments: [to, Number(amount * 100_000_000)],
            },
            publicKey : cedraAccount.publicKey,
          });
          console.log("simulated txn : ",simulatedTxn);
          setSimulatedTxn(simulatedTxn);
          setAccount(fromAccount);
        } catch (err: any) {
          console.error("Simulation error:", err);
          setError(err?.message || "Failed to simulate transaction");
        }
      }
    };

    getData();
  }, [cedraAccount,amount,cedraNetwork,to]);

  const handleContinue = async () => {
    if (!account) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const submittedTxn = await sendCoinTransaction({
        amount: Number(amount * 100_000_000),
        fromAccount: account,
        nodeUrl: cedraNetwork,
        toAddress: AccountAddress.fromString(to),
      });
      if (submittedTxn) {
        navigate("/wallet/success");
      }
    } catch (err: any) {
      console.error("Transaction error:", err);
      setError(err?.message || "Transaction failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <SelectTokenTopBar title="Confirm" />
      <div className={styles.content}>
        {error && (
          <div className={styles.errorContainer}>
            <span className={styles.errorText}>{error}</span>
          </div>
        )}
        
        <div className={styles.tokenIconContainer}>
          <div className={styles.tokenIcon} />
        </div>
        <div className={styles.card}>
          <div className={styles.row}>
            <span className={styles.label}>Token:</span>
            <span className={styles.value}>{symbol}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>From:</span>
            <span className={styles.value}>
              {shortenAddress(
                cedraAccount?.accountAddress.toStringWithoutPrefix(),
              )}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>To:</span>
            <span className={styles.value}>{shortenAddress(to.substring(2))}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Sum:</span>
            <span className={styles.value}>
              {amount} {symbol}
            </span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Fees:</span>
            <span className={styles.value}>
              {(Number(simulatedTxn?.gas_used) / 100_000_000) < 0.0000001 ? "<0.0000001" :  (Number(simulatedTxn?.gas_used) / 100_000_000)} {symbol}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <button
          className={styles.continueButton}
          onClick={handleContinue}
          type="button"
          disabled={isLoading || !account}
        >
          {isLoading ? "Sending..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
