// core/hooks/useSidebarNavigation.ts
import { PENDING_PAGE } from "core/constants";
import { getSidebarState, updateSidebarState } from "core/utils/sidebar";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const useSidebarNavigation = () => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const syncSidebarState = async () => {
      const nextState = await getSidebarState();

      if (isMounted) {
        setIsOpened(nextState);
      }
    };

    syncSidebarState();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const openInSidebar = useCallback(
    async (customPath?: string) => {
      if (!chrome.sidePanel) return;

      const pathToOpen = customPath || location.pathname;

      await chrome.storage.local.set({
        [PENDING_PAGE]: pathToOpen,
      });

      setIsOpened(true);
      await updateSidebarState(true);

      await chrome.sidePanel
        .setPanelBehavior({
          openPanelOnActionClick: true,
        })
        .catch(console.error);

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
    },
    [location.pathname],
  );

  const openInPopup = useCallback(async () => {
    setIsOpened(false);
    await updateSidebarState(false);

    await chrome.sidePanel
      .setPanelBehavior({
        openPanelOnActionClick: false,
      })
      .catch(console.error);

    window.close();
  }, []);

  return { openInSidebar, openInPopup, isOpened };
};
