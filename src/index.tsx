// src/index.tsx
import "./polyfills";
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { WalletStateProvider } from "core/hooks/useWalletState";
import { CookiesProvider } from "react-cookie";
import App from "App";
import "./core/styles/theme.css";
import { getSidebarState } from "core/utils/sidebar";

document.documentElement.dataset.theme = "dark";

const queryClient = new QueryClient();

const isDappRequestPopup = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash || "";

  if (hash.startsWith("#/popup/")) return true;

  if (
    hash.startsWith("#/wallet/unlock") &&
    searchParams.get("unlock") === "true"
  ) {
    return true;
  }

  return false;
};

const checkAndOpenSidebar = async () => {
  // Keep dApp approval/unlock flows in popup mode so request context is preserved.
  if (isDappRequestPopup()) {
    return false;
  }

  const isOpened = await getSidebarState()

  if (isOpened) {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    
    if (tab?.windowId) {
      await chrome.sidePanel.open({
        windowId: tab.windowId,
      });
    }
    window.close();
    return true;
  }
  
  return false;
};
checkAndOpenSidebar().then((shouldClose) => {
  if (!shouldClose) {
    const root = createRoot(document.getElementById("root") as Element);
    
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <CookiesProvider>
            <WalletStateProvider>
              <App isSidePanel={false} />
            </WalletStateProvider>
          </CookiesProvider>
        </QueryClientProvider>
      </StrictMode>,
    );
  }
});
