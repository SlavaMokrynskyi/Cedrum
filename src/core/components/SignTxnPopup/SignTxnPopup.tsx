import React, { useEffect, useMemo, useState } from "react";
import styles from "./SignTxnPopup.module.css";
import { CedrumLogoSvg } from "core/image/CedrumLogoSvg";
import { CloseIconSvg } from "core/image/CloseIconSvg";
import { MessageMethod } from "core/types";

const ChevronDownSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

type ApprovalPreview = {
  method: string;
  origin?: string;
  url?: string;
  accountAddress?: string | null;
  simulation?: {
    success?: boolean;
    gasUsed?: number | string | null;
    gasUnitPrice?: number | string | null;
    estimatedFeeOctas?: string | null;
    vmStatus?: string | null;
    error?: string;
  } | null;
  txPreview?: {
    function: string;
    typeArguments?: string[];
    functionArguments: string[];
  } | null;
};

const OCTAS_PER_CED = BigInt(100_000_000);

const formatOctasToCed = (value: string | number | null | undefined) => {
  if (value === null || typeof value === "undefined") return "N/A";
  try {
    const octas = BigInt(String(value));
    const whole = octas / OCTAS_PER_CED;
    const fraction = (octas % OCTAS_PER_CED)
      .toString()
      .padStart(8, "0")
      .replace(/0+$/, "");
    return fraction.length > 0 ? `${whole}.${fraction} CED` : `${whole} CED`;
  } catch {
    return String(value);
  }
};

const resolveEstimatedFeeOctas = (
  simulation?: ApprovalPreview["simulation"],
): string | null => {
  if (!simulation) return null;
  if (simulation.estimatedFeeOctas) return simulation.estimatedFeeOctas;
  if (
    typeof simulation.gasUsed === "undefined" ||
    simulation.gasUsed === null ||
    typeof simulation.gasUnitPrice === "undefined" ||
    simulation.gasUnitPrice === null
  ) {
    return null;
  }

  try {
    return (
      BigInt(String(simulation.gasUsed)) * BigInt(String(simulation.gasUnitPrice))
    ).toString();
  } catch {
    return null;
  }
};

const getTransferAmountOctas = (
  txPreview?: ApprovalPreview["txPreview"] | null,
): string | null => {
  if (!txPreview?.function || txPreview.functionArguments.length < 2) return null;
  if (
    txPreview.function !== "0x1::coin::transfer" &&
    txPreview.function !== "0x1::cedra_account::transfer"
  ) {
    return null;
  }
  return txPreview.functionArguments[1];
};

export default function SignTxnPopup() {
  const [showDetails, setShowDetails] = useState(false);
  const [approval, setApproval] = useState<ApprovalPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const requestId = Number(searchParams.get("id"));
  const requestKey = searchParams.get("requestKey") || "";
  const fallbackOrigin = searchParams.get("origin") || "";
  const fallbackUrl = searchParams.get("url") || fallbackOrigin;
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

  const origin = approval?.origin || fallbackOrigin;
  const siteUrl = approval?.url || fallbackUrl;

  const displayUrl = useMemo(() => {
    try {
      return new URL(siteUrl).host;
    } catch {
      return siteUrl || origin || "Unknown site";
    }
  }, [origin, siteUrl]);

  const siteDetails = useMemo(() => {
    try {
      const parsed = new URL(siteUrl);
      return {
        host: parsed.host,
        fullUrl: parsed.href,
        origin: parsed.origin,
      };
    } catch {
      return {
        host: siteUrl || origin || "Unknown site",
        fullUrl: siteUrl || origin || "Unknown site",
        origin: origin || "Unknown origin",
      };
    }
  }, [origin, siteUrl]);

  const txPreview = approval?.txPreview || null;
  const txTypeArgs = txPreview?.typeArguments || [];
  const txArgs = txPreview?.functionArguments || [];
  const simulation = approval?.simulation || null;
  const estimatedFeeOctas = resolveEstimatedFeeOctas(simulation);
  const transferAmountOctas = getTransferAmountOctas(txPreview);
  const simulationFailed = simulation?.success === false;
  const signDisabled =
    isLoading || !!loadError || !txPreview?.function || simulationFailed;

  const title =
    approval?.method === MessageMethod.SIGN_AND_SUBMIT_TRANSACTION
      ? "Sign & Submit Transaction"
      : "Sign Transaction";

  const sendDecision = async (approved: boolean) => {
    if (!Number.isFinite(requestId)) {
      window.close();
      return;
    }

    if (approved && signDisabled) return;

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
          <h1 className={styles.title}>{title}</h1>
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
        <div className={styles.blockHeader}>Estimate Changes</div>
        {isLoading && (
          <div className={styles.blockContent}>Loading transaction data...</div>
        )}
        {!isLoading && loadError && (
          <div className={styles.errorText}>{loadError}</div>
        )}
        {!isLoading && !loadError && (
          <div className={styles.detailsGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Function</span>
              <span className={styles.detailValue}>{txPreview?.function}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Type Args</span>
              <span className={styles.detailValue}>
                {txTypeArgs.length > 0 ? txTypeArgs.join(", ") : "None"}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>From</span>
              <span className={styles.detailValue}>
                {approval?.accountAddress || "N/A"}
              </span>
            </div>
            {transferAmountOctas && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Amount</span>
                <span className={styles.detailValue}>
                  {formatOctasToCed(transferAmountOctas)}
                </span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Simulation</span>
              <span
                className={`${styles.detailValue} ${
                  simulationFailed ? styles.statusError : styles.statusSuccess
                }`}
              >
                {simulationFailed ? "Failed" : "Success"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.block}>
        <div className={styles.feeRow}>
          <span className={styles.feeLabel}>Network Fee</span>
          <span className={styles.feeValue}>
            {formatOctasToCed(estimatedFeeOctas)}
          </span>
        </div>
        <button
          className={styles.detailsButton}
          onClick={() => setShowDetails(!showDetails)}
          type="button"
        >
          <span>See more details</span>
          <ChevronDownSvg
            className={`${styles.chevron} ${showDetails ? styles.chevronUp : ""}`}
          />
        </button>
        {showDetails && (
          <div className={styles.detailsContent}>
            {txArgs.length === 0 ? (
              <div className={styles.blockContent}>No function arguments</div>
            ) : (
              <div className={styles.argsList}>
                {txArgs.map((arg, index) => (
                  <div key={`${index}-${arg}`} className={styles.argRow}>
                    <span className={styles.argKey}>Arg {index + 1}</span>
                    <span className={styles.argValue}>{arg}</span>
                  </div>
                ))}
              </div>
            )}
            {simulation?.vmStatus && (
              <div className={styles.metaLine}>
                VM Status: {simulation.vmStatus}
              </div>
            )}
            {typeof simulation?.gasUsed !== "undefined" &&
              simulation?.gasUsed !== null && (
                <div className={styles.metaLine}>
                  Gas Used: {String(simulation.gasUsed)}
                </div>
              )}
            {typeof simulation?.gasUnitPrice !== "undefined" &&
              simulation?.gasUnitPrice !== null && (
                <div className={styles.metaLine}>
                  Gas Unit Price: {String(simulation.gasUnitPrice)}
                </div>
              )}
            {simulation?.error && (
              <div className={styles.errorText}>{simulation.error}</div>
            )}
          </div>
        )}
      </div>

      <div className={styles.warning}>Sign only if you trust this website</div>

      <div className={styles.buttonGroup}>
        <button
          className={styles.cancelButton}
          onClick={() => sendDecision(false)}
        >
          Cancel
        </button>
        <button
          className={styles.signButton}
          onClick={() => sendDecision(true)}
          disabled={signDisabled}
        >
          Sign
        </button>
      </div>
    </div>
  );
}
