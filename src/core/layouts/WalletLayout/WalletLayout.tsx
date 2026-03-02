import NavBar from "core/components/NavBar/NavBar";
import React, { Suspense } from "react";
import styles from "./WalletLayout.module.css";
import { Outlet, useLocation } from "react-router-dom";
import PageIsLoading from "core/components/PageIsLoading/PageIsLoading";

export default function WalletLayout() {
  const location = useLocation();
  const showNavBar = ["/wallet/portfolio", "/wallet/nft", "/wallet/will-be-soon"].includes(location.pathname);

  return (
    <>
      <div className={`${styles.screen} ${showNavBar ? styles.withNavBar : ""}`}>
        <main className={styles.content}>
          <div className={styles.pageViewport}>
            <div className={styles.pageInner}>
              <Suspense fallback={<PageIsLoading />}>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
      {showNavBar && <NavBar />}
    </>
  );
}
