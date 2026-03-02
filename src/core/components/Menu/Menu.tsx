import React, { useEffect, useState } from "react";
import styles from "./Menu.module.css";
import { CedrumLogoSvg } from "core/image/CedrumLogoSvg";
import { ArrowRightSvg } from "core/image/ArrowRightSvg";
import { ArrowLeftSvg } from "core/image/ArrowLeftSvg";
import { useNavigate } from "react-router-dom";
import useWalletState from "core/hooks/useWalletState";
import { lockSessionNow } from "core/utils/lock";

interface ButtonItemProps {
  label: string,
  path?: string,
  onClick?: () => void,
  isDanger?: boolean,
};

export default function Menu() {
  const [accountName, setAccountName] = useState<string>("");
  const navigate = useNavigate();

  const { cedraAccount, getAccountInfoByAddress } = useWalletState();

  const handleBlock = async () => {
    await lockSessionNow();
    navigate("/");
  };

  const ButtonsHandleOnClick = (item: ButtonItemProps) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const topButtons: ButtonItemProps[] = [
    { label: "Wallet", path: "/wallet/wallet-page" },
    { label: "CEDRA", onClick: () => window.open("https://cedra.network/", "_blank") },
  ];

  const groupButtons: ButtonItemProps[] = [
    { label: "My Account", path: "/wallet/account" },
    { label: "Language", path: "/wallet/language" },
    { label: "Report a Bug", onClick: () => window.open("https://discord.gg/madPfnsj8f", "_blank") },
    { label: "Block", onClick: handleBlock, isDanger: true },
  ];

  useEffect(() => {
    const getData = async () => {
      if (!cedraAccount) return;

      const accoutntInfo = getAccountInfoByAddress(cedraAccount?.accountAddress.toString());

      if (!accoutntInfo || !accoutntInfo.walletName) return;

      setAccountName(accoutntInfo.walletName)
    };
    if (cedraAccount) {
      getData();
    }
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
          {topButtons.map((item, index) => (
            <button
              key={index}
              className={styles.menuItem}
              onClick={() => ButtonsHandleOnClick(item)}
            >
              <span className={styles.menuLabel}>{item.label}</span>
              <ArrowRightSvg className={styles.chevron} />
            </button>
          ))}
        </div>
        <div className={styles.groupBlock}>
          {groupButtons.map((item, index) => (
            <button
              key={index}
              className={`${styles.groupItem} ${item.isDanger ? styles.danger : ""}`}
              onClick={() => ButtonsHandleOnClick(item)}
            >
              <span className={styles.menuLabel}>{item.label}</span>
              <ArrowRightSvg className={styles.chevron} />
            </button>
          ))}
        </div>
        <button
          className={styles.bottomItem}
          onClick={() =>
            window.open("https://cedrum-wallet.vercel.app", "_blank")
          }
        >
          <span className={styles.menuLabel}>O Cedrum</span>
        </button>
      </div>
    </div>
  );
}
