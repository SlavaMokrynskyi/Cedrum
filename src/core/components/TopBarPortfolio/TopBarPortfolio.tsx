import React, { useState } from "react";
import styles from "./TopBarPortfolio.module.css";
import { CopyAddressIconSvg } from "core/image/CopyAddressIconSvg";
import { SideBarIconSvg } from "core/image/SideBarIconSvg";
import SidebarModal from "../ModalSettings/SidebarModal";
import { CedrumLogoSvg } from "core/image/CedrumLogoSvg";
import CedraLogo from "core/image/CedraLogo.png";
import { useSidebarNavigation } from "core/hooks/useSidebarNavigation";
import useWalletState from "core/hooks/useWalletState";
import { useClipboard } from "@chakra-ui/react";

export default function TopBarPortfolio() {
  const [modalActive, setModalActive] = useState(false);

  const { cedraAccount } = useWalletState();
  const { openInSidebar,isOpened,openInPopup } = useSidebarNavigation();

  const { hasCopied, onCopy } = useClipboard(
    cedraAccount?.accountAddress.toString()!,
  );

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.leftSection}>
          <button
            className={styles.iconBtn}
            onClick={() => setModalActive((prev) => !prev)}
            type="button"
          >
            <CedrumLogoSvg className={styles.cedrumLogo} />
          </button>
        </div>
        <div className={styles.pillWrapper}>
          <div className={styles.pill} role="group" aria-label="Network">
            <div className={styles.pillLeft}>
              <img className={styles.pillLeftLogo} src={CedraLogo} alt=""></img>
            </div>

            <div className={styles.pillCenter}>
              <span className={styles.title}>Cedra</span>
            </div>

            <button
              className={styles.pillRight}
              type="button"
              aria-label={hasCopied ? "Copied!" : "Copy address"}
              onClick={onCopy}
            >
              <CopyAddressIconSvg className={styles.copyIcon} />
            </button>
          </div>
          {hasCopied && (
            <div className={styles.copyMessage}>
              Copied!
            </div>
          )}
        </div>
        <div className={styles.rightSection}>
          <button
            className={styles.iconBtn}
            onClick={() => {
              isOpened ? openInPopup() : openInSidebar()
            }}
            type="button"
            aria-label="Open sidebar"
          >
            <SideBarIconSvg className={styles.sidebarIcon} />
          </button>
        </div>
      </div>
      <SidebarModal open={modalActive} onClose={() => setModalActive(false)} />
    </>
  );
}
