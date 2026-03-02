import React from "react";
import styles from "./TransactionDescription.module.css";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import CedraLogo from "core/image/CedraLogo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { TransactionResponseType } from "@cedra-labs/ts-sdk";
import useWalletState from "core/hooks/useWalletState";
import { CEDRA_OCTAS_PER_COIN, CEDRASCAN_TX_URL } from "core/constants";

interface DisplayData {
  type: TransactionResponseType;
  hash: string;
  sender: string;
  amount: number;
  recipient: string;
  isIncoming: boolean;
  date: string;
  time: string;
  gas_used?: string;
  success?: boolean;
}

const ShareIconSvg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export default function TransactionDescription() {
  const { cedraNetwork } = useWalletState();
  const navigate = useNavigate();
  const location = useLocation();
  const displayData = location.state?.displayData as DisplayData | undefined;

  const fallback: DisplayData = {
    type: TransactionResponseType.User,
    hash: "-",
    sender: "-",
    recipient: "-",
    amount: 0,
    isIncoming: true,
    date: "-",
    time: "-",
    gas_used: "-",
    success: true,
  };

  const tx = displayData || fallback;
  const isCanceled = tx.success === false;
  const isPending = tx.type === TransactionResponseType.Pending;
  const isConfirmed = !isCanceled && !isPending;

  const formatGasFee = (gasUsed?: string) => {
    if (!gasUsed || gasUsed === "-") return "0.0000000 CED";

    const gasNum = Number(gasUsed);
    if (isNaN(gasNum)) return "0.0000000 CED";

    const cedAmount = gasNum / CEDRA_OCTAS_PER_COIN;
    return `${cedAmount.toFixed(7)} CED`;
  };

  const handleShare = () => {
    const cedraScanUrl = `${CEDRASCAN_TX_URL}/${tx.hash}?network=${cedraNetwork}`;
    window.open(cedraScanUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeftSvg className={styles.icon} />
        </button>
        <h1 className={styles.title}>Transaction result</h1>
        <button className={styles.shareButton} onClick={handleShare}>
          <ShareIconSvg className={styles.icon} />
        </button>
      </div>

      <div className={styles.iconContainer}>
        <div className={styles.circleIcon}>
          <img src={CedraLogo} alt="Transaction status" />
        </div>
      </div>
      <div className={styles.statusContainer}>
        {isConfirmed && <span className={styles.confirmed}>Confirmed</span>}
        {isCanceled && <span className={styles.canceled}>Canceled</span>}
        {isPending && <span className={styles.pending}>Pending</span>}
      </div>
      <div className={styles.detailsContainer}>
        <div className={styles.detailBlock}>
          <div className={styles.label}>Sum:</div>
          <div className={styles.valueRow}>
            <span className={`${styles.sign} ${tx.isIncoming ? styles.incoming : styles.outgoing}`}>
              {tx.isIncoming ? "+" : "-"}
            </span>
            <span className={styles.value}>{tx.amount} CED</span>
          </div>
        </div>
        <div className={styles.detailBlock}>
          <div className={styles.label}>Fees:</div>
          <div className={styles.value}>{formatGasFee(tx.gas_used)}</div>
        </div>
        <div className={styles.detailBlock}>
          <div className={styles.label}>From:</div>
          <div className={styles.address}>{tx.sender}</div>
        </div>
        <div className={styles.detailBlock}>
          <div className={styles.label}>To:</div>
          <div className={styles.address}>{tx.recipient}</div>
        </div>
        <div className={styles.detailBlock}>
          <div className={styles.label}>Data and time:</div>
          <div className={styles.value}>
            <b>{tx.date} {tx.time}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
