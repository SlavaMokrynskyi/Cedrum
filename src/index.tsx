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
import { isFullscreenExtensionView } from "core/utils/extensionView";

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

const enableFullscreenExtensionShell = (): (() => void) => {
  const html = document.documentElement;
  const body = document.body;
  const root = document.getElementById("root");

  if (!root) {
    return () => {};
  }

  const previous = {
    htmlWidth: html.style.width,
    htmlHeight: html.style.height,
    htmlMinWidth: html.style.minWidth,
    htmlMinHeight: html.style.minHeight,
    htmlOverflow: html.style.overflow,
    htmlBackground: html.style.background,
    bodyMargin: body.style.margin,
    bodyWidth: body.style.width,
    bodyHeight: body.style.height,
    bodyMinWidth: body.style.minWidth,
    bodyMinHeight: body.style.minHeight,
    bodyDisplay: body.style.display,
    bodyPlaceItems: body.style.placeItems,
    bodyPadding: body.style.padding,
    bodyBoxSizing: body.style.boxSizing,
    bodyOverflow: body.style.overflow,
    bodyBackground: body.style.background,
    rootWidth: root.style.width,
    rootHeight: root.style.height,
    rootMinWidth: root.style.minWidth,
    rootMinHeight: root.style.minHeight,
    rootMaxWidth: root.style.maxWidth,
    rootMaxHeight: root.style.maxHeight,
    rootPosition: root.style.position,
    rootOverflow: root.style.overflow,
    rootBorderRadius: root.style.borderRadius,
    rootBoxShadow: root.style.boxShadow,
    rootBackground: root.style.background,
    rootTransform: root.style.transform,
    rootTransformOrigin: root.style.transformOrigin,
  };

  html.style.width = "100vw";
  html.style.height = "100vh";
  html.style.minWidth = "0";
  html.style.minHeight = "0";
  html.style.overflow = "hidden";
  html.style.background = "#0e0f14";

  body.style.margin = "0";
  body.style.width = "100vw";
  body.style.height = "100vh";
  body.style.minWidth = "0";
  body.style.minHeight = "0";
  body.style.display = "grid";
  body.style.placeItems = "center";
  body.style.padding = "24px";
  body.style.boxSizing = "border-box";
  body.style.overflow = "hidden";
  body.style.background =
    "radial-gradient(circle at top, rgba(255, 255, 255, 0.08), transparent 45%), #0e0f14";

  root.style.width = "min(420px, calc(100vw - 48px))";
  root.style.height = "min(760px, calc(100vh - 48px))";
  root.style.minWidth = "320px";
  root.style.minHeight = "min(640px, calc(100vh - 48px))";
  root.style.maxWidth = "100%";
  root.style.maxHeight = "100%";
  root.style.position = "relative";
  root.style.overflow = "hidden";
  root.style.borderRadius = "24px";
  root.style.boxShadow = "0 24px 80px rgba(0, 0, 0, 0.45)";
  root.style.background = "#0e0f14";
  // Make fixed descendants anchor to the centered shell instead of the browser viewport.
  root.style.transform = "translateZ(0)";
  root.style.transformOrigin = "center";

  return () => {
    html.style.width = previous.htmlWidth;
    html.style.height = previous.htmlHeight;
    html.style.minWidth = previous.htmlMinWidth;
    html.style.minHeight = previous.htmlMinHeight;
    html.style.overflow = previous.htmlOverflow;
    html.style.background = previous.htmlBackground;

    body.style.margin = previous.bodyMargin;
    body.style.width = previous.bodyWidth;
    body.style.height = previous.bodyHeight;
    body.style.minWidth = previous.bodyMinWidth;
    body.style.minHeight = previous.bodyMinHeight;
    body.style.display = previous.bodyDisplay;
    body.style.placeItems = previous.bodyPlaceItems;
    body.style.padding = previous.bodyPadding;
    body.style.boxSizing = previous.bodyBoxSizing;
    body.style.overflow = previous.bodyOverflow;
    body.style.background = previous.bodyBackground;

    root.style.width = previous.rootWidth;
    root.style.height = previous.rootHeight;
    root.style.minWidth = previous.rootMinWidth;
    root.style.minHeight = previous.rootMinHeight;
    root.style.maxWidth = previous.rootMaxWidth;
    root.style.maxHeight = previous.rootMaxHeight;
    root.style.position = previous.rootPosition;
    root.style.overflow = previous.rootOverflow;
    root.style.borderRadius = previous.rootBorderRadius;
    root.style.boxShadow = previous.rootBoxShadow;
    root.style.background = previous.rootBackground;
    root.style.transform = previous.rootTransform;
    root.style.transformOrigin = previous.rootTransformOrigin;
  };
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
    const rootElement = document.getElementById("root") as Element;
    const restoreFullscreenExtensionShell = isFullscreenExtensionView()
      ? enableFullscreenExtensionShell()
      : null;
    const root = createRoot(rootElement);

    const app = (
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <CookiesProvider>
            <WalletStateProvider>
              <App isSidePanel={false} />
            </WalletStateProvider>
          </CookiesProvider>
        </QueryClientProvider>
      </StrictMode>
    );

    if (restoreFullscreenExtensionShell) {
      window.addEventListener("pagehide", restoreFullscreenExtensionShell, {
        once: true,
      });
    }

    root.render(app);
  }
});
