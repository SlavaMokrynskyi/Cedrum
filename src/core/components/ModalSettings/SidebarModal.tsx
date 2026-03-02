import React, { useEffect, useState } from "react";
import styles from "./SidebarModal.module.css";
import { CedrumLogoSvg } from "core/image/CedrumLogoSvg";
import { ArrowRightSvg } from "core/image/ArrowRightSvg";
import { useNavigate } from "react-router-dom";
import { useSidebarNavigation } from "core/hooks/useSidebarNavigation";
import { lockSessionNow } from "core/utils/lock";
import useWalletState from "core/hooks/useWalletState";
import { getAccountBalance } from "core/utils/helper";
import {
  CEDRA_OCTAS_PER_COIN,
  DEFAULT_ACCOUNT_NAME,
} from "core/constants";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SidebarModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { openInSidebar } = useSidebarNavigation();
  const { cedraAccount, getAccountInfoByAddress, cedraNetwork } = useWalletState();
  const [balance, setBalance] = useState<string>("$0.00");

  useEffect(() => {
    const fetchBalance = async () => {
      if (!cedraAccount || !cedraNetwork) return;

      try {
        const bal = await getAccountBalance(
          cedraAccount.accountAddress,
          cedraNetwork,
        );
        const usdBalance = (Number(bal) / CEDRA_OCTAS_PER_COIN).toFixed(2);
        setBalance(`$${usdBalance}`);
      } catch {
        setBalance("$0.00");
      }
    };

    fetchBalance();
  }, [cedraAccount, cedraNetwork]);

  const accountInfo = cedraAccount
    ? getAccountInfoByAddress(cedraAccount.accountAddress.toString())
    : null;
  const accountName = accountInfo?.walletName || DEFAULT_ACCOUNT_NAME;

  const handleBlock = async () => {
    await lockSessionNow();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.searchBlock}>
          <button type="button" className={styles.accountRow}>
            <div>
              <span className={styles.iconWrap}>
                <CedrumLogoSvg className={styles.icon} />
              </span>
              <span className={styles.accountName}>{accountName}</span>
            </div>
            <div>
              <span className={styles.balance}>{balance}</span>
            </div>
          </button>
        </div>

        <div className={styles.divider} />

        <button
          type="button"
          className={styles.menuItem}
          onClick={() => navigate("/wallet/menu")}
        >
          <span>Menu</span>
          <ArrowRightSvg className={styles.chevron} />
        </button>

        <button
          type="button"
          className={styles.menuItem}
          onClick={() => void openInSidebar()}
        >
          <span>Sidebar Extension</span>
          <ArrowRightSvg className={styles.chevron} />
        </button>

        <div className={styles.divider} />

        <button
          type="button"
          onClick={handleBlock}
          className={`${styles.menuItem} ${styles.danger}`}
        >
          <span>Block</span>
        </button>
      </div>
    </div>
  );
}
