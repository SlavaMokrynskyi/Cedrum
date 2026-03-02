// sidepanel.tsx
import "./polyfills";
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { WalletStateProvider } from "core/hooks/useWalletState";
import { CookiesProvider } from "react-cookie";
import App from "App";
import "./core/styles/theme.css";

document.documentElement.dataset.theme = "dark";

const queryClient = new QueryClient();

const root = createRoot(document.getElementById("sidepanel_root") as Element);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CookiesProvider>
        <WalletStateProvider>
          <App isSidePanel={true} />
        </WalletStateProvider>
      </CookiesProvider>
    </QueryClientProvider>
  </StrictMode>,
);
