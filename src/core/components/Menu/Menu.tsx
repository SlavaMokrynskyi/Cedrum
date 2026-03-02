import React, { useEffect, useState } from "react";
import styles from "./Menu.module.css";
import { CedrumLogoSvg } from "core/image/CedrumLogoSvg";
import { ArrowRightSvg } from "core/image/ArrowRightSvg";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import { useNavigate } from "react-router-dom";
import useWalletState from "core/hooks/useWalletState";
import { lockSessionNow } from "core/utils/lock";
import {
  CEDRA_WEBSITE_URL,
  CEDRUM_BUG_REPORT_URL,
  CEDRUM_WEBSITE_URL,
} from "core/constants";

interface ButtonItemProps {
  label: string;
  path?: string;
  onClick?: () => void;
  isDanger?: boolean;
}

const openExternalUrl = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export default function Menu() {
  const [accountName, setAccountName] = useState<string>("");
  const navigate = useNavigate();
  const { cedraAccount, getAccountInfoByAddress } = useWalletState();

  const handleBlock = async () => {
    await lockSessionNow();
    navigate("/");
  };

  const handleButtonClick = (item: ButtonItemProps) => {
    if (item.onClick) {
      item.onClick();
      return;
    }

    if (item.path) {
      navigate(item.path);
    }
  };

  const topButtons: ButtonItemProps[] = [
    { label: "Wallet", path: "/wallet/wallet-page" },
    { label: "CEDRA", onClick: () => openExternalUrl(CEDRA_WEBSITE_URL) },
  ];

  const groupButtons: ButtonItemProps[] = [
    { label: "My Account", path: "/wallet/account" },
    { label: "Language", path: "/wallet/language" },
    {
      label: "Report a Bug",
      onClick: () => openExternalUrl(CEDRUM_BUG_REPORT_URL),
    },
    { label: "Block", onClick: handleBlock, isDanger: true },
  ];

  useEffect(() => {
    if (!cedraAccount) {
      setAccountName("");
      return;
    }

    const accountInfo = getAccountInfoByAddress(
      cedraAccount.accountAddress.toString(),
    );

    setAccountName(accountInfo?.walletName || "");
  }, [cedraAccount, getAccountInfoByAddress]);

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <ArrowLeftSvg className={styles.backIcon} />
      </button>

      <div className={styles.header}>
        <CedrumLogoSvg className={styles.logo} />
        <div className={styles.accountNameWrapper}>
          <h1 className={styles.title}>{accountName}</h1>
        </div>
      </div>

      <div className={styles.menuContainer}>
        <div className={styles.topButtons}>
          {topButtons.map((item) => (
            <button
              key={item.label}
              className={styles.menuItem}
              onClick={() => handleButtonClick(item)}
            >
              <span className={styles.menuLabel}>{item.label}</span>
              <ArrowRightSvg className={styles.chevron} />
            </button>
          ))}
        </div>
        <div className={styles.groupBlock}>
          {groupButtons.map((item) => (
            <button
              key={item.label}
              className={`${styles.groupItem} ${item.isDanger ? styles.danger : ""}`}
              onClick={() => handleButtonClick(item)}
            >
              <span className={styles.menuLabel}>{item.label}</span>
              <ArrowRightSvg className={styles.chevron} />
            </button>
          ))}
        </div>
        <button
          className={styles.bottomItem}
          onClick={() => openExternalUrl(CEDRUM_WEBSITE_URL)}
        >
          <span className={styles.menuLabel}>O Cedrum</span>
        </button>
      </div>
    </div>
  );
}
