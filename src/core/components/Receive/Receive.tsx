import React, { useEffect, useState } from "react";
import styles from "./Receive.module.css";
import { ArrowLeftSvg } from "../../image/ArrowLeftSvg";
import { InfoIconSvg } from "../../image/InfoIconSvg";
import { CopyAddressIconSvg } from "../../image/CopyAddressIconSvg";
import { useNavigate } from "react-router-dom";
import { SelectedCedraAccount } from "core/types";
import { getSelectedAccountFromStorage } from "core/utils/account";
import StyledQr from "../QRcode/QRcode";

type MessageState = { text: string; type: "success" | "error" } | null;

export default function Receive() {
  const [message, setMessage] = useState<MessageState>(null);
  const [account, setAccount] = useState<SelectedCedraAccount | null>(null);

  const navigate = useNavigate();

  const handleCopy = async () => {
    if (!account?.address) return;

    try {
      await navigator.clipboard.writeText(account.address);
      setMessage({ text: "Copied!", type: "success" });
      window.setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage({ text: "Copy failed", type: "error" });
      window.setTimeout(() => setMessage(null), 2000);
    }
  };

  useEffect(() => {
    const getData = async () => {
      const acc = await getSelectedAccountFromStorage();
      setAccount(acc);
    };

    getData();
  }, []);

  const displayAddress = account?.address ? account.address.substring(2) : "not found";

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.iconButton} onClick={() => navigate(-1)}>
          <ArrowLeftSvg className={styles.icon} />
        </button>

        <h1 className={styles.title}>Receive</h1>

        <button
          className={styles.iconButton}
          onClick={() => {
            // якщо захочеш модалку — підключиш тут
          }}
        >
          <InfoIconSvg className={styles.infoIcon} />
        </button>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.qrContainer}>
        <div className={styles.qrCard}>
          <div className={styles.qrFrame}>
            {account?.address ? (
              <StyledQr text={account.address} size={260} />
            ) : (
              <span className={styles.qrHint}>QR Code</span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.addressSection}>
        <h2 className={styles.addressLabel}>Your wallet address</h2>

        <div className={styles.addressCard}>
          <div className={styles.addressText}>{displayAddress}</div>

          <button className={styles.copyButton} onClick={handleCopy} disabled={!account?.address}>
            <CopyAddressIconSvg className={styles.copyIcon} />
            <span>Copy</span>
          </button>
        </div>
      </div>

      <p className={styles.footerText}>
        This address can only be used to receive compatible tokens.{" "}
      </p>
    </div>
  );
}
