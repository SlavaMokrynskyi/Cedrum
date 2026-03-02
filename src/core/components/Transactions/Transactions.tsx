import React, { useEffect, useState, useMemo } from "react";
import styles from "./Transactions.module.css";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import { FilterIconSvg } from "core/image/FilterIconSvg";
import { useNavigate } from "react-router-dom";
import {
  TransactionResponse,
  UserTransactionResponse,
  PendingTransactionResponse,
  isUserTransactionResponse,
  isPendingTransactionResponse,
  TransactionResponseType,
  EntryFunctionPayloadResponse,
} from "@cedra-labs/ts-sdk";
import { createClient, shortenAddress } from "core/utils/helper";
import useWalletState from "core/hooks/useWalletState";

import { getUserTransactions } from "core/queries/transaction";

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
  timestamp?: number;
}

type TransactionType = UserTransactionResponse | PendingTransactionResponse;
type FilterType = "all" | "incoming" | "outgoing";

export default function Transactions() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [filterType, setFilterType] = useState<FilterType>(() => {
    const saved = sessionStorage.getItem("txFilterType");
    return (saved as FilterType) || "all";
  });
  const [dateFrom, setDateFrom] = useState(() => sessionStorage.getItem("txDateFrom") || "");
  const [dateTo, setDateTo] = useState(() => sessionStorage.getItem("txDateTo") || "");
  const [showFilters, setShowFilters] = useState(false);
  
  const [tempFilterType, setTempFilterType] = useState<FilterType>("all");
  const [tempDateFrom, setTempDateFrom] = useState("");
  const [tempDateTo, setTempDateTo] = useState("");
  
  const navigate = useNavigate();
  const { cedraAccount, cedraNetwork } = useWalletState();

  useEffect(() => {
    sessionStorage.setItem("txFilterType", filterType);
    sessionStorage.setItem("txDateFrom", dateFrom);
    sessionStorage.setItem("txDateTo", dateTo);
  }, [filterType, dateFrom, dateTo]);

  const openFilters = () => {
    setTempFilterType(filterType);
    setTempDateFrom(dateFrom);
    setTempDateTo(dateTo);
    setShowFilters(true);
  };

  const applyFilters = () => {
    setFilterType(tempFilterType);
    setDateFrom(tempDateFrom);
    setDateTo(tempDateTo);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setTempFilterType("all");
    setTempDateFrom("");
    setTempDateTo("");
  };

  const formatTimestamp = (
    timestampStr: string,
  ): { date: string; time: string } => {
    try {
      const timestamp = parseInt(timestampStr) / 1000;
      const date = new Date(timestamp);
      return {
        date: date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).replace(/\//g, "."),
        time: date.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch {
      return { date: "N/A", time: "N/A" };
    }
  };

  const isIncomingTransaction = (txn: TransactionType): boolean => {
    const currentAddress =
      cedraAccount?.accountAddress.toString();
    if (!currentAddress) return false;

    return txn.sender !== currentAddress;
  };

  const getDisplayData = (txn: TransactionResponse): DisplayData | null => {
    if (isUserTransactionResponse(txn)) {
      const payload = txn.payload as EntryFunctionPayloadResponse;
      const { date, time } = formatTimestamp(txn.timestamp);
      const data: DisplayData = {
        type: TransactionResponseType.User,
        hash: txn.hash,
        sender: txn.sender,
        recipient: payload.arguments[0],
        amount: payload.arguments[1] / 100_000_000,
        isIncoming: isIncomingTransaction(txn),
        date: date,
        time: time,
        gas_used: txn.gas_used,
        success: txn.success,
        timestamp: parseInt(txn.timestamp) / 1000,
      };
      return data;
    } else if (isPendingTransactionResponse(txn)) {
      const payload = txn.payload as EntryFunctionPayloadResponse;
      const data: DisplayData = {
        type: TransactionResponseType.Pending,
        hash: txn.hash,
        sender: txn.sender,
        recipient: payload.arguments[0],
        amount: payload.arguments[1] / 100_000_000,
        isIncoming: isIncomingTransaction(txn),
        date: "Waiting",
        time: "Waiting",
        timestamp: Date.now(),
      };
      return data;
    } else {
      return null;
    }
  };

  const sortedTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    if (filterType === "incoming") {
      filtered = filtered.filter(txn => {
        const data = getDisplayData(txn);
        return data?.isIncoming;
      });
    } else if (filterType === "outgoing") {
      filtered = filtered.filter(txn => {
        const data = getDisplayData(txn);
        return data && !data.isIncoming;
      });
    }
    
    if (dateFrom) {
      const fromTime = new Date(dateFrom).getTime();
      filtered = filtered.filter(txn => {
        const data = getDisplayData(txn);
        return data && data.timestamp && data.timestamp >= fromTime;
      });
    }
    
    if (dateTo) {
      const toTime = new Date(dateTo).getTime() + 86400000; // Add 24 hours to include the entire day
      filtered = filtered.filter(txn => {
        const data = getDisplayData(txn);
        return data && data.timestamp && data.timestamp <= toTime;
      });
    }
    
    return filtered.sort((a, b) => {
      const dataA = getDisplayData(a);
      const dataB = getDisplayData(b);
      
      if (!dataA || !dataB) return 0;
      
      const timeA = dataA.timestamp || 0;
      const timeB = dataB.timestamp || 0;
      
      return timeB - timeA;
    });
  }, [transactions, filterType, dateFrom, dateTo]);

  const hasActiveFilters = filterType !== "all" || dateFrom || dateTo;

  useEffect(() => {
    const getData = async () => {
      if (cedraAccount) {
        const client = createClient(cedraNetwork);
        if (!client) return;
        const txns = await getUserTransactions(
          cedraAccount,
          client,
        );
        setTransactions(txns);
      }
    };
    getData();
  }, [cedraAccount, cedraNetwork]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeftSvg className={styles.icon} />
        </button>
        <h1 className={styles.title}>Recent activity</h1>
        <button className={styles.filterButton} onClick={openFilters}>
          <FilterIconSvg className={styles.icon} />
          {hasActiveFilters && <span className={styles.filterDot} />}
        </button>
      </div>

      {showFilters && (
        <div className={styles.modalOverlay} onClick={() => setShowFilters(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Filters</h2>
              <button className={styles.modalClose} onClick={() => setShowFilters(false)}>×</button>
            </div>
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Transactions</label>
              <div className={styles.filterOptions}>
                <button
                  className={`${styles.filterOption} ${tempFilterType === "all" ? styles.filterOptionActive : ""}`}
                  onClick={() => setTempFilterType("all")}
                >
                  All
                </button>
                <button
                  className={`${styles.filterOption} ${tempFilterType === "incoming" ? styles.filterOptionActive : ""}`}
                  onClick={() => setTempFilterType("incoming")}
                >
                  Received
                </button>
                <button
                  className={`${styles.filterOption} ${tempFilterType === "outgoing" ? styles.filterOptionActive : ""}`}
                  onClick={() => setTempFilterType("outgoing")}
                >
                  Sent
                </button>
              </div>
            </div>
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Period</label>
              <div className={styles.dateInputs}>
                <div className={styles.dateField}>
                  <span className={styles.dateLabel}>From</span>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={tempDateFrom}
                    onChange={(e) => setTempDateFrom(e.target.value)}
                  />
                </div>
                <div className={styles.dateField}>
                  <span className={styles.dateLabel}>To</span>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={tempDateTo}
                    onChange={(e) => setTempDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.clearButton} onClick={clearFilters}>
                Clear all
              </button>
              <button className={styles.applyButton} onClick={applyFilters}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.transactionsList}>
        {transactions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Any transactions</p>
          </div>
        ) : sortedTransactions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No transactions found</p>
          </div>
        ) : (
          sortedTransactions.map((txn) => {
            const displayData = getDisplayData(txn);
            if (!displayData) return null;
            return (
              <button
                key={displayData.hash}
                className={styles.transactionCard}
                onClick={() =>
                  navigate(`/wallet/transaction/${displayData.hash}`, {
                    state: { displayData: displayData },
                  })
                }
              >
                <div className={styles.iconCircle}>
                  <img src="/d59ecf7928adf3ab5305.png" alt="Transaction" />
                </div>

                <div className={styles.middleSection}>
                  <div className={styles.addressRow}>
                    <span className={styles.addressLabel}>
                      {displayData.isIncoming ? "From:" : "To:"}
                    </span>
                    <span className={styles.address}>
                      {displayData.isIncoming
                        ? shortenAddress(displayData.sender)
                        : displayData.recipient
                          ? shortenAddress(displayData.recipient)
                          : "N/A"}
                    </span>
                  </div>
                  <div className={styles.amountRow}>
                    {displayData.type !== TransactionResponseType.Pending && (
                      <span
                        className={`${styles.sign} ${displayData.isIncoming ? styles.incoming : styles.outgoing}`}
                      >
                        {displayData.isIncoming ? "+" : "-"}
                      </span>
                    )}
                    <span className={styles.amount}>
                      {displayData.type !== TransactionResponseType.Pending &&
                        `${displayData.amount}`}
                      {" CED"}
                    </span>
                  </div>
                </div>
                <div className={styles.rightSection}>
                  <div className={styles.dateRow}>
                    <span className={styles.date}>{displayData.date}</span>
                  </div>
                  <div className={styles.timeRow}>
                    <span className={styles.time}>{displayData.time}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
