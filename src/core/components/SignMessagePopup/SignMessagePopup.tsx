import React, { useEffect, useMemo, useState } from "react";
import styles from "./SignMessagePopup.module.css";
import { MessageMethod } from "core/types";

type ApprovalPreview = {
  method: string;
  origin?: string;
  url?: string;
  messagePreview?: string | null;
};

export default function SignMessagePopup() {
  const [approval, setApproval] = useState<ApprovalPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const requestId = Number(searchParams.get("id"));
  const requestKey = searchParams.get("requestKey") || "";
  const origin = searchParams.get("origin") || "";
  const siteUrl = searchParams.get("url") || origin;
  const favIconUrl = searchParams.get("favIconUrl") || "";

  useEffect(() => {
    let isMounted = true;

    const loadApproval = async () => {
      if (!Number.isFinite(requestId)) {
        if (isMounted) {
          setLoadError("Invalid request id");
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await chrome.runtime.sendMessage({
          method: MessageMethod.GET_PENDING_APPROVAL,
          id: requestId,
          requestKey,
        });

        if (!isMounted) return;

        if (response?.error) {
          setLoadError(response.error);
          setIsLoading(false);
          return;
        }

        if (!response?.approval) {
          setLoadError("Pending request details are unavailable");
          setIsLoading(false);
          return;
        }

        setApproval(response.approval as ApprovalPreview);
      } catch (error: any) {
        if (!isMounted) return;
        setLoadError(error?.message || String(error));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadApproval();

    return () => {
      isMounted = false;
    };
  }, [requestId, requestKey]);

  const approvalOrigin = approval?.origin || origin;
  const approvalUrl = approval?.url || siteUrl;

  const displayUrl = useMemo(() => {
    try {
      return new URL(approvalUrl).host;
    } catch {
      return approvalUrl || approvalOrigin || "Unknown site";
    }
  }, [approvalOrigin, approvalUrl]);

  const siteDetails = useMemo(() => {
    try {
      const parsed = new URL(approvalUrl);
      return {
        host: parsed.host,
        fullUrl: parsed.href,
        origin: parsed.origin,
      };
    } catch {
      return {
        host: approvalUrl || approvalOrigin || "Unknown site",
        fullUrl: approvalUrl || approvalOrigin || "Unknown site",
        origin: approvalOrigin || "Unknown origin",
      };
    }
  }, [approvalOrigin, approvalUrl]);

  const messagePreview = approval?.messagePreview || "";

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
      <div className={styles.dappSection}>
        <div className={styles.dappIcon}>
          {favIconUrl ? (
            <img src={favIconUrl} alt="" className={styles.dappIconImage} />
          ) : (
            <div className={styles.triangle} />
          )}
        </div>
        <div className={styles.dappInfo}>
          <h1 className={styles.title}>Sign Message</h1>
          <p className={styles.url}>{displayUrl}</p>
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockHeader}>Requesting Site</div>
        <div className={styles.siteHost}>{siteDetails.host}</div>
        <div className={styles.siteText}>{siteDetails.fullUrl}</div>
        <div className={styles.siteText}>Origin: {siteDetails.origin}</div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockHeader}>Message</div>
        <div className={styles.messageContent}>
          {isLoading
            ? "Loading message..."
            : loadError
              ? loadError
              : messagePreview || "Empty message"}
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.networkRow}>
          <span className={styles.networkLabel}>Method</span>
          <span className={styles.networkValue}>
            {approval?.method || MessageMethod.SIGN_MESSAGE}
          </span>
        </div>
      </div>

      <div className={styles.warning}>
        Sign only if you trust this website
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.cancelButton} onClick={() => sendDecision(false)}>
          Cancel
        </button>
        <button className={styles.signButton} onClick={() => sendDecision(true)}>
          Sign
        </button>
      </div>
    </div>
  );
}
