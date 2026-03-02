import React, { useEffect } from "react";
import UnlockBody from "core/components/UnlockBody/UnlockBody";
import { enableWindowFlowSizing } from "./windowFlowSizing";

export default function UnlockPage() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isPopupUnlock = searchParams.get("unlock") === "true";

    if (!isPopupUnlock) return;

    const restoreWindowFlowSizing = enableWindowFlowSizing();
    return restoreWindowFlowSizing;
  }, []);

  return <UnlockBody />;
}
