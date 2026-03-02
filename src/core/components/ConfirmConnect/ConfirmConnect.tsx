import React from "react";
import styles from "./ConfirmConnect.module.css";
import { MessageMethod } from "core/types";

export default function ConfirmConnect() {
  const searchParams = new URLSearchParams(window.location.search);
  const requestId = Number(searchParams.get("id"));
  const requestKey = searchParams.get("requestKey") || "";
  const origin = searchParams.get("origin") || "";
  const siteUrl = searchParams.get("url") || origin;
  const favIconUrl = searchParams.get("favIconUrl") || "";

  const mainUrl = (() => {
    try {
      return new URL(siteUrl).host;
    } catch {
      return siteUrl || origin || "Unknown site";
    }
  })();

  const sendDecision = async (approved: boolean) => {
    if (!Number.isFinite(requestId)) {
      window.close();
      return;
    }

    await chrome.runtime.sendMessage({
      method: MessageMethod.SEND_CONFIRM,
      id: requestId,
      requestKey,
      data: { approved, requestKey },
    });

    window.close();
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerDivider} />
      <div className={styles.iconSection}>
        <div className={styles.dappIcon}>
          {favIconUrl ? (
            <img src={favIconUrl} alt="" />
          ) : (
            <div className={styles.triangle} />
          )}
        </div>
      </div>

      <div className={styles.urlSection}>
        <h1 className={styles.mainUrl}>{mainUrl}</h1>
        <p className={styles.subUrl}>{siteUrl}</p>
      </div>

      <div className={styles.divider} />

      <div className={styles.permissionsSection}>
        <p className={styles.permissionsTitle}>This app would like to:</p>
        <div className={styles.permissionItem}>
          View your wallet balance & activity
        </div>
        <div className={styles.permissionItem}>
          Request approval for transactions
        </div>
      </div>

      <div className={styles.warning}>
        Connect only if you trust this website
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.cancelButton} onClick={() => sendDecision(false)}>
          Cancel
        </button>
        <button className={styles.connectButton} onClick={() => sendDecision(true)}>
          Connect
        </button>
      </div>
    </div>
  );
}
